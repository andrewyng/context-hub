---
name: rest-api
description: "Moralis Web3 Data REST API Python coding guidelines using httpx async"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "moralis,web3,nft,defi,wallet,blockchain,ethereum,api"
---

# Moralis Web3 Data REST API Python Coding Guidelines

You are a Moralis Web3 Data API coding expert. Help me with writing code using the Moralis REST API with httpx async in Python.

You can find the official documentation here:
https://docs.moralis.com/

## Golden Rule: Use httpx Async with X-API-Key Authentication

Always use `httpx` with async/await for all Moralis API interactions. Authenticate using the `X-API-Key` header. Moralis provides Web3 data across multiple EVM chains (Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Base, etc.) and Solana. Never hardcode API keys in source code.

## Installation

```bash
pip install httpx
```

**Environment Variables:**

```bash
export MORALIS_API_KEY='your_moralis_api_key_here'
```

Load environment variables in Python:

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("MORALIS_API_KEY")
```

## Base URL

```
https://deep-index.moralis.io/api/v2.2
```

Swagger documentation: https://deep-index.moralis.io/api-docs-2.2/

## Authentication

Moralis uses a simple API key passed in the `X-API-Key` header.

```python
import httpx


class MoralisClient:
    BASE_URL = "https://deep-index.moralis.io/api/v2.2"

    def __init__(self, api_key: str):
        self.headers = {
            "X-API-Key": api_key,
            "accept": "application/json",
        }

    async def get(self, path: str, params: dict | None = None) -> dict | list:
        url = f"{self.BASE_URL}{path}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, params=params or {})
            resp.raise_for_status()
            return resp.json()

    async def post(self, path: str, json_data: dict | None = None) -> dict | list:
        url = f"{self.BASE_URL}{path}"
        headers = {**self.headers, "Content-Type": "application/json"}
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=json_data)
            resp.raise_for_status()
            return resp.json()
```

## Rate Limiting

Moralis uses a Compute Units (CU) system. Each endpoint has a CU weight, and your plan determines throughput.

| Plan | Throughput |
|---|---|
| Free | 150 CU/s |
| Pro | 150 CU/s |
| Business | 300 CU/s |
| Enterprise | Custom |

Common endpoint weights:
- Most wallet/token endpoints: 1-5 CU
- NFT endpoints: 5-10 CU
- Complex/premium endpoints: 10-25 CU

```python
import asyncio

semaphore = asyncio.Semaphore(10)  # Limit concurrent requests

async def rate_limited_get(client: MoralisClient, path: str, params: dict | None = None):
    async with semaphore:
        result = await client.get(path, params=params)
        await asyncio.sleep(0.1)  # Basic pacing
        return result
```

You can check endpoint weights at:
```
GET https://deep-index.moralis.io/api/v2/info/endpointWeights
```

## Methods

### Get Native Balance by Wallet

```python
async def get_native_balance(
    client: MoralisClient, address: str, chain: str = "eth"
) -> dict:
    """Get native token balance (ETH, MATIC, BNB, etc.) for a wallet.

    Args:
        address: Wallet address (0x...).
        chain: Chain identifier - eth, polygon, bsc, arbitrum, optimism, avalanche, base, linea, etc.
    """
    return await client.get(f"/{address}/balance", params={"chain": chain})

# Usage
import asyncio

async def main():
    moralis = MoralisClient(api_key)
    result = await get_native_balance(moralis, "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")
    print(f"Balance: {int(result['balance']) / 1e18} ETH")

asyncio.run(main())
```

### Get ERC20 Token Balances

```python
async def get_token_balances(
    client: MoralisClient,
    address: str,
    chain: str = "eth",
    token_addresses: list[str] | None = None,
) -> list:
    """Get all ERC20 token balances for a wallet.

    Args:
        address: Wallet address.
        chain: Chain identifier.
        token_addresses: Optional list of specific token contract addresses to filter.
    """
    params = {"chain": chain}
    if token_addresses:
        params["token_addresses"] = token_addresses
    return await client.get(f"/wallets/{address}/tokens", params=params)
```

### Get Token Price

```python
async def get_token_price(
    client: MoralisClient,
    address: str,
    chain: str = "eth",
    include: str = "percent_change",
) -> dict:
    """Get the price of a token by contract address.

    Args:
        address: Token contract address.
        chain: Chain identifier.
        include: Additional data - "percent_change" for 24hr change.
    """
    params = {"chain": chain, "include": include}
    return await client.get(f"/erc20/{address}/price", params=params)
```

### Get Wallet Transactions

```python
async def get_wallet_transactions(
    client: MoralisClient,
    address: str,
    chain: str = "eth",
    limit: int = 100,
    cursor: str | None = None,
    order: str = "DESC",
) -> dict:
    """Get native transactions for a wallet.

    Args:
        address: Wallet address.
        chain: Chain identifier.
        limit: Number of results (max 100).
        cursor: Pagination cursor from previous response.
        order: Sort order - "DESC" or "ASC".
    """
    params = {"chain": chain, "limit": limit, "order": order}
    if cursor:
        params["cursor"] = cursor
    return await client.get(f"/{address}", params=params)
```

### Get Wallet History (Categorized)

```python
async def get_wallet_history(
    client: MoralisClient,
    address: str,
    chain: str = "eth",
    limit: int = 100,
    cursor: str | None = None,
    order: str = "DESC",
) -> dict:
    """Get full transaction history with automatic categorization.

    Categories: Send, Receive, NFT Send, NFT Receive, Token Send, Token Receive,
    Token Swap, Deposit, Withdraw, Airdrop, Mint, Burn, NFT Purchase, NFT Sale,
    Borrow, Contract Interaction.
    """
    params = {"chain": chain, "limit": limit, "order": order}
    if cursor:
        params["cursor"] = cursor
    return await client.get(f"/wallets/{address}/history", params=params)
```

### Get NFTs by Wallet

```python
async def get_nfts_by_wallet(
    client: MoralisClient,
    address: str,
    chain: str = "eth",
    limit: int = 100,
    cursor: str | None = None,
    normalise_metadata: bool = True,
) -> dict:
    """Get all NFTs owned by a wallet with metadata.

    Args:
        address: Wallet address.
        chain: Chain identifier.
        normalise_metadata: If True, returns parsed metadata.
    """
    params = {
        "chain": chain,
        "limit": limit,
        "normalise_metadata": str(normalise_metadata).lower(),
    }
    if cursor:
        params["cursor"] = cursor
    return await client.get(f"/{address}/nft", params=params)
```

### Get NFT Metadata

```python
async def get_nft_metadata(
    client: MoralisClient,
    address: str,
    token_id: str,
    chain: str = "eth",
    normalise_metadata: bool = True,
) -> dict:
    """Get metadata for a specific NFT.

    Args:
        address: NFT contract address.
        token_id: Token ID.
        chain: Chain identifier.
    """
    params = {
        "chain": chain,
        "normalise_metadata": str(normalise_metadata).lower(),
    }
    return await client.get(f"/nft/{address}/{token_id}", params=params)
```

### Get NFT Collection Metadata

```python
async def get_nft_collection(
    client: MoralisClient, address: str, chain: str = "eth"
) -> dict:
    """Get metadata for an NFT collection/contract."""
    return await client.get(f"/nft/{address}/metadata", params={"chain": chain})
```

### Get Block by Number or Hash

```python
async def get_block(
    client: MoralisClient, block_number_or_hash: str, chain: str = "eth"
) -> dict:
    """Get block details including transactions.

    Args:
        block_number_or_hash: Block number (as string) or block hash.
        chain: Chain identifier.
    """
    return await client.get(f"/block/{block_number_or_hash}", params={"chain": chain})
```

### Resolve ENS Domain

```python
async def resolve_ens_domain(client: MoralisClient, domain: str) -> dict:
    """Resolve an ENS domain to an address.

    Args:
        domain: ENS domain name (e.g., "vitalik.eth").
    """
    return await client.get(f"/resolve/ens/{domain}")
```

### Resolve Address to ENS

```python
async def resolve_address(client: MoralisClient, address: str) -> dict:
    """Reverse resolve an address to its ENS domain."""
    return await client.get(f"/resolve/{address}/reverse")
```

### Get DeFi Positions

```python
async def get_defi_positions(
    client: MoralisClient, address: str, chain: str = "eth"
) -> dict:
    """Get DeFi protocol positions for a wallet (premium endpoint)."""
    return await client.get(
        f"/wallets/{address}/defi/positions", params={"chain": chain}
    )
```

### Get Token Metadata

```python
async def get_token_metadata(
    client: MoralisClient, addresses: list[str], chain: str = "eth"
) -> list:
    """Get metadata for ERC20 tokens by contract address.

    Args:
        addresses: List of token contract addresses.
        chain: Chain identifier.
    """
    return await client.get(
        "/erc20/metadata", params={"chain": chain, "addresses": addresses}
    )
```

### Paginate Through All Results

```python
async def paginate_all(
    client: MoralisClient,
    path: str,
    params: dict,
    max_pages: int = 10,
) -> list:
    """Paginate through all results using cursor-based pagination.

    Args:
        path: API endpoint path.
        params: Query parameters.
        max_pages: Maximum number of pages to fetch.
    """
    all_results = []
    cursor = None

    for _ in range(max_pages):
        if cursor:
            params["cursor"] = cursor
        result = await client.get(path, params=params)
        all_results.extend(result.get("result", []))

        cursor = result.get("cursor")
        if not cursor:
            break

    return all_results

# Get all NFTs for a wallet (up to 10 pages)
# all_nfts = await paginate_all(moralis, "/0xABC.../nft", {"chain": "eth", "limit": 100})
```

## Error Handling

```python
async def safe_request(
    client: MoralisClient, path: str, params: dict | None = None
) -> dict | list | None:
    """Make a request with error handling."""
    try:
        return await client.get(path, params=params)
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        try:
            body = e.response.json()
            message = body.get("message", "")
        except Exception:
            message = e.response.text

        if status == 400:
            print(f"Bad request: {message}")
        elif status == 401:
            print("Unauthorized - check your API key")
        elif status == 429:
            print("Rate limited - reduce request frequency")
            await asyncio.sleep(1)
        elif status == 404:
            print(f"Not found: {message}")
        elif status >= 500:
            print(f"Moralis server error ({status}): {message}")
        else:
            print(f"HTTP {status}: {message}")
        return None
    except httpx.RequestError as e:
        print(f"Network error: {e}")
        return None
```

### Common HTTP Error Codes

| Status | Description |
|---|---|
| 400 | Bad request - invalid address, chain, or parameters |
| 401 | Unauthorized - missing or invalid API key |
| 404 | Not found - address or resource does not exist |
| 429 | Rate limit exceeded - too many compute units consumed |
| 500 | Internal server error |

## Common Pitfalls

1. **Chain Parameter** - Always pass the `chain` parameter. It defaults to `eth` but must be explicit for other chains. Valid values: `eth`, `polygon`, `bsc`, `arbitrum`, `optimism`, `avalanche`, `base`, `linea`, `fantom`, `cronos`, `palm`, `gnosis`.

2. **Checksum Addresses** - Moralis accepts both checksummed and non-checksummed Ethereum addresses, but always validate addresses before sending.

3. **Cursor Pagination** - Most list endpoints return paginated results with a `cursor` field. Use `cursor` for the next page, not `page` or `offset` numbers.

4. **Balance Precision** - Native balances and token balances are returned in wei (or smallest unit). Divide by `10**decimals` to get human-readable values. Always get `decimals` from token metadata.

5. **Premium Endpoints** - Some endpoints (DeFi positions, wallet history categorization) are premium and cost more CUs. Check your plan tier before relying on them.

6. **Supported Chains** - Not all endpoints support all chains. NFT and DeFi endpoints may have limited chain support compared to wallet/token endpoints.

7. **Rate Limit by CU, Not Requests** - Rate limiting is based on total compute units per second, not raw request count. Heavy endpoints consume more CUs. Use the endpoint weights API to plan your request budget.

8. **Address Casing** - While Ethereum addresses are case-insensitive, always lowercase addresses when constructing URLs to avoid unexpected 404s on some endpoints.

## Useful Links

- Official Documentation: https://docs.moralis.com/
- EVM API Reference: https://docs.moralis.com/web3-data-api/evm/reference
- Wallet API: https://docs.moralis.com/web3-data-api/evm/reference/wallet-api
- Rate Limits: https://docs.moralis.com/web3-data-api/evm/reference/rate-limits
- Endpoint Weights: https://docs.moralis.com/web3-data-api/evm/reference/endpoint-weights
- Swagger Docs: https://deep-index.moralis.io/api-docs-2.2/
- Get API Key: https://docs.moralis.com/web3-data-api/evm/get-your-api-key
- Supported Chains: https://docs.moralis.com/supported-chains

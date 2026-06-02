---
name: rest-api
description: "Tally - Indian Accounting & ERP Integration API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "tally,accounting,erp,india,gst,invoicing,inventory,api"
---

# Tally Integration API - Python Guide

## Overview

TallyPrime (and Tally.ERP 9) is India's most widely used accounting and ERP software. Tally does **not** expose a traditional REST/JSON API. Instead, it provides an **XML-over-HTTP** interface where TallyPrime runs as a local HTTP server and accepts XML POST requests on a configurable port (default: `9000`).

All communication uses XML envelopes with `HEADER` and `BODY` sections. The three core request types are **Export** (read data), **Import** (create/update data), and **Execute** (run TDL functions).

- **Protocol**: HTTP POST with XML body
- **Default endpoint**: `http://localhost:9000`
- **Content-Type**: `text/xml` (responses in UTF-8)
- **Authentication**: None by default (local network access); configure firewall/network restrictions in production
- **Official docs**: https://help.tallysolutions.com/xml-interface/

## XML Envelope Structure

Every request follows this structure:

```xml
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export|Import</TALLYREQUEST>
    <TYPE>Data|Collection|Object</TYPE>
    <ID>Report or Collection Name</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <!-- Configuration parameters -->
      </STATICVARIABLES>
    </DESC>
    <DATA>
      <!-- For Import requests only -->
    </DATA>
  </BODY>
</ENVELOPE>
```

### Header Fields

| Field | Values | Description |
|-------|--------|-------------|
| `VERSION` | `1` | XML interface version |
| `TALLYREQUEST` | `Export`, `Import` | Action type |
| `TYPE` | `Data`, `Collection`, `Object`, `Function` | What to retrieve or send |
| `ID` | Report/collection name | e.g., `List of Ledgers`, `All Masters`, `Trial Balance` |

## Installation

```bash
pip install httpx lxml
```

## Python Client

```python
import httpx
from lxml import etree


class TallyClient:
    """Async client for TallyPrime XML-over-HTTP interface."""

    def __init__(self, host: str = "localhost", port: int = 9000):
        self.base_url = f"http://{host}:{port}"
        self.headers = {"Content-Type": "text/xml; charset=utf-8"}

    async def _post_xml(self, xml_body: str) -> str:
        """Send an XML request to TallyPrime and return the raw XML response."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.base_url,
                content=xml_body.encode("utf-8"),
                headers=self.headers,
            )
            response.raise_for_status()
            return response.text

    def _parse_xml(self, xml_text: str) -> etree._Element:
        """Parse XML response string into an lxml Element."""
        return etree.fromstring(xml_text.encode("utf-8"))

    async def export_report(
        self,
        report_id: str,
        report_type: str = "Data",
        static_vars: dict | None = None,
    ) -> etree._Element:
        """Export data from TallyPrime (read operation)."""
        vars_xml = ""
        if static_vars:
            var_lines = [
                f"<{k}>{v}</{k}>" for k, v in static_vars.items()
            ]
            vars_xml = "\n".join(var_lines)

        xml_request = f"""<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>{report_type}</TYPE>
    <ID>{report_id}</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        {vars_xml}
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>"""
        raw = await self._post_xml(xml_request)
        return self._parse_xml(raw)

    async def import_data(
        self,
        tally_message_xml: str,
        import_id: str = "All Masters",
        duplicate_handling: str = "@@DUPCOMBINE",
    ) -> dict:
        """Import (create/update) masters or vouchers into TallyPrime."""
        xml_request = f"""<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Import</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>{import_id}</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <IMPORTDUPS>{duplicate_handling}</IMPORTDUPS>
      </STATICVARIABLES>
    </DESC>
    <DATA>
      <TALLYMESSAGE>
        {tally_message_xml}
      </TALLYMESSAGE>
    </DATA>
  </BODY>
</ENVELOPE>"""
        raw = await self._post_xml(xml_request)
        root = self._parse_xml(raw)
        return {
            "created": root.findtext(".//CREATED", "0"),
            "altered": root.findtext(".//ALTERED", "0"),
            "errors": root.findtext(".//ERRORS", "0"),
            "last_vch_id": root.findtext(".//LASTVCHID", "0"),
        }
```

## Common Operations

### Export Ledger List

```python
import asyncio


async def list_ledgers():
    tally = TallyClient()

    # Export the collection of all ledgers
    xml_request = """<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>List of Ledgers</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>"""

    raw_response = await tally._post_xml(xml_request)
    root = tally._parse_xml(raw_response)

    ledgers = []
    for collection in root.iter("COLLECTION"):
        for ledger in collection.iter("LEDGER"):
            name = ledger.findtext("NAME", "")
            parent = ledger.findtext("PARENT", "")
            ledgers.append({"name": name, "parent": parent})

    for ledger in ledgers:
        print(f"  {ledger['name']} ({ledger['parent']})")

    return ledgers


asyncio.run(list_ledgers())
```

### Export Trial Balance

```python
async def get_trial_balance():
    tally = TallyClient()
    root = await tally.export_report(
        report_id="Trial Balance",
        static_vars={"EXPLODEFLAG": "Yes"},
    )

    for entry in root.iter("DSPACCNAME"):
        name = entry.findtext("DSPDISPNAME", "")
        print(f"Account: {name}")

    return root


asyncio.run(get_trial_balance())
```

### Create a Ledger

```python
async def create_ledger(name: str, parent_group: str, opening_balance: float = 0):
    tally = TallyClient()

    ledger_xml = f"""<LEDGER NAME="{name}" Action="Create">
  <NAME>{name}</NAME>
  <PARENT>{parent_group}</PARENT>
  <OPENINGBALANCE>{opening_balance}</OPENINGBALANCE>
</LEDGER>"""

    result = await tally.import_data(ledger_xml)
    print(f"Created: {result['created']}, Errors: {result['errors']}")
    return result


asyncio.run(create_ledger("HDFC Bank", "Bank Accounts", -50000))
```

### Create a Sales Voucher (Invoice)

```python
async def create_sales_voucher(
    party_name: str,
    ledger_name: str,
    amount: float,
    date: str,
    voucher_number: str,
):
    """Create a sales voucher. Date format: YYYYMMDD."""
    tally = TallyClient()

    voucher_xml = f"""<VOUCHER VCHTYPE="Sales" Action="Create">
  <DATE>{date}</DATE>
  <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
  <VOUCHERNUMBER>{voucher_number}</VOUCHERNUMBER>
  <PARTYLEDGERNAME>{party_name}</PARTYLEDGERNAME>
  <ALLLEDGERENTRIES.LIST>
    <LEDGERNAME>{party_name}</LEDGERNAME>
    <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
    <AMOUNT>-{amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>
  <ALLLEDGERENTRIES.LIST>
    <LEDGERNAME>{ledger_name}</LEDGERNAME>
    <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
    <AMOUNT>{amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>
</VOUCHER>"""

    result = await tally.import_data(
        voucher_xml, import_id="All Masters"
    )
    print(f"Voucher created: {result}")
    return result


asyncio.run(
    create_sales_voucher(
        party_name="ABC Enterprises",
        ledger_name="Sales Account",
        amount=25000.00,
        date="20260317",
        voucher_number="S-001",
    )
)
```

### Export GST Summary Data

```python
async def get_gst_summary(from_date: str, to_date: str):
    """Export GST summary. Dates in YYYYMMDD format."""
    tally = TallyClient()
    root = await tally.export_report(
        report_id="GST - GSTR1",
        static_vars={
            "SVFROMDATE": from_date,
            "SVTODATE": to_date,
            "EXPLODEFLAG": "Yes",
        },
    )
    return root


asyncio.run(get_gst_summary("20260401", "20260430"))
```

### Export Stock Items (Inventory)

```python
async def list_stock_items():
    tally = TallyClient()

    xml_request = """<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>List of Stock Items</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>"""

    raw = await tally._post_xml(xml_request)
    root = tally._parse_xml(raw)

    items = []
    for item in root.iter("STOCKITEM"):
        items.append({
            "name": item.findtext("NAME", ""),
            "parent": item.findtext("PARENT", ""),
        })
    return items


asyncio.run(list_stock_items())
```

## Configuration Notes

### Enabling Tally as HTTP Server

1. Open TallyPrime
2. Press `F12` (Configuration) or go to **Help > Settings**
3. Under **Connectivity**, set:
   - **Tally.NET Server**: enable as needed
   - **Port**: `9000` (or custom)
4. Ensure the port is accessible from your application host

### Network Access

By default Tally listens on `localhost`. For remote access, bind to `0.0.0.0` in Tally configuration and ensure firewall rules allow traffic on the configured port.

### Date Format

Tally uses `YYYYMMDD` format in XML (e.g., `20260317` for March 17, 2026). Negative amounts in `AMOUNT` fields represent debit entries.

### Duplicate Handling on Import

| Value | Behavior |
|-------|----------|
| `@@DUPCOMBINE` | Merge with existing record |
| `@@DUPMODIFY` | Overwrite existing record |
| `@@DUPIGNORE` | Skip if record exists |

## Error Handling

```python
import httpx


async def safe_tally_request(tally: TallyClient, xml_body: str) -> str | None:
    try:
        return await tally._post_xml(xml_body)
    except httpx.ConnectError:
        print("ERROR: Cannot connect to TallyPrime. Is it running on the configured port?")
        return None
    except httpx.TimeoutException:
        print("ERROR: Request timed out. The report may be too large.")
        return None
    except httpx.HTTPStatusError as e:
        print(f"ERROR: HTTP {e.response.status_code}")
        return None
```

## References

- Official XML Interface Guide: https://help.tallysolutions.com/xml-interface/
- Integration Methods: https://help.tallysolutions.com/integration-methods-and-technologies/
- XML Request Examples: https://help.tallysolutions.com/case-study-1/
- Sample XML: https://help.tallysolutions.com/sample-xml/

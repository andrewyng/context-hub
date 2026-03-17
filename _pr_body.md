## What

Adds curated documentation for the [LetsFG](https://github.com/LetsFG/LetsFG) MCP server.

**LetsFG** is an MCP server for live flight search and booking across 400+ airlines. It runs 102 direct airline connectors locally via Playwright (Ryanair, EasyJet, Wizz Air, Southwest, AirAsia, Norwegian, and more) — no API key needed. An optional API key adds GDS/NDC sources (Amadeus, Duffel, Sabre, Travelport).

### Content added

- `content/letsfg/docs/mcp/javascript/DOC.md` — Full MCP tool reference including:
  - Installation and MCP client configuration
  - All 8 tools documented (search_flights, resolve_location, unlock_flight_offer, book_flight, start_checkout, setup_payment, get_agent_profile, system_info)
  - Response structures with JSON examples
  - Typical agent flow (search → unlock → book)
  - List of 102 covered airlines
  - Python SDK alternative

### Package info

- npm: [letsfg-mcp](https://www.npmjs.com/package/letsfg-mcp) (v1.0.2)
- PyPI: [letsfg](https://pypi.org/project/letsfg/) (v1.0.6)
- GitHub: [LetsFG/LetsFG](https://github.com/LetsFG/LetsFG)
- Source: maintainer

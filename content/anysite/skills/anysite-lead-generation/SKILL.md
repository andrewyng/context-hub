---
name: anysite-lead-generation
description: "LinkedIn prospect discovery, email finding, company research, and contact enrichment for sales"
metadata:
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "prospecting,outreach,email-finder,contacts,b2b,crm"
---

# anysite Lead Generation

Professional lead generation and prospecting using the anysite MCP server. Find prospects on LinkedIn, discover verified emails, extract contacts from websites, and build comprehensive lead lists for sales, recruiting, and business development.

## Overview

- **Find qualified prospects** on LinkedIn using advanced search filters
- **Enrich profiles** with work history, education, and skills
- **Discover email addresses** through LinkedIn email finding
- **Extract contact information** from company websites
- **Research companies** to identify target accounts
- **Build prospect lists** formatted for CRM import

## Supported Platforms

- **LinkedIn** (Primary): People search, profile enrichment, email discovery, company research, employee listings
- **Web Scraping**: Contact extraction from websites, sitemap parsing, general web data
- **Instagram**: Business account discovery and profile analysis (supplementary)
- **Y Combinator**: Startup company and founder research (supplementary)

## Quick Start

### Step 1: Identify Your Lead Source

| Goal | Primary Tool | Use Case |
|------|-------------|----------|
| Find prospects by title/company | `search_linkedin_users` | B2B prospecting, targeted outreach |
| Enrich existing leads | `get_linkedin_profile` | Add work history, education, skills |
| Find verified emails | `find_linkedin_user_email` | Email outreach campaigns |
| Extract website contacts | `parse_webpage` | Get emails/phones from contact pages |
| Research target companies | `search_linkedin_companies` | Account-based marketing (ABM) |
| Find company employees | `search_linkedin_users` + company filter | Multi-threading into accounts |

### Step 2: Execute Data Collection

**Find Sales VPs in San Francisco**
```
Tool: mcp__anysite__search_linkedin_users
Parameters:
- title: "VP Sales"
- location: "San Francisco Bay Area"
- count: 25
```

**Enrich a LinkedIn Profile**
```
Tool: mcp__anysite__get_linkedin_profile
Parameters:
- user: "linkedin.com/in/johndoe" or "johndoe"
- with_experience: true
- with_education: true
- with_skills: true
```

**Find Email Address**
```
Tool: mcp__anysite__find_linkedin_user_email
Parameters:
- email: "john@company.com" (for reverse lookup)
- count: 5
```

**Extract Contacts from Website**
```
Tool: mcp__anysite__parse_webpage
Parameters:
- url: "https://company.com/contact"
- extract_contacts: true
- strip_all_tags: true
```

### Step 3: Process and Analyze Results

Review the returned data for:
- **Profile completeness**: Work history, education, skills presence
- **Contact quality**: Email deliverability, phone format
- **Relevance scoring**: Title match, company fit, location alignment
- **Enrichment opportunities**: Missing data that can be filled

### Step 4: Format Output

**CSV Export**: Full prospect list with all fields, ready for CRM import (Salesforce, HubSpot)
**JSON Export**: Structured data for custom integration and automation
**Chat Summary**: Top prospects with key details and actionable next steps

## Common Workflows

### Workflow 1: LinkedIn B2B Prospecting

**Scenario**: Find 50 qualified prospects at SaaS companies

1. **Search for prospects**: `search_linkedin_users` with title, location, company keywords, count=50
2. **Enrich top prospects** (10-20): `get_linkedin_profile` with experience and education
3. **Find email addresses**: `find_linkedin_user_email` + `get_linkedin_user_email_db`
4. **Export to CRM**: CSV with Full Name, Title, Company, Location, Email, LinkedIn URL

### Workflow 2: Account-Based Marketing (ABM)

**Scenario**: Find decision-makers at specific target companies

1. **Research target companies**: `search_linkedin_companies` with ICP criteria
2. **Get company details**: `get_linkedin_company` for each target
3. **Find employees**: `search_linkedin_users` with company filter + title filter
4. **Enrich decision-makers**: `get_linkedin_profile` + `find_linkedin_user_email`
5. **Create ABM campaign**: Group by company, identify multi-threading opportunities

### Workflow 3: Website Contact Extraction

**Scenario**: Extract contacts from company websites

1. **Get company websites** from LinkedIn or existing list
2. **Parse contact pages**: `parse_webpage` with `extract_contacts=true` on /contact, /about/team
3. **Get sitemap**: `get_sitemap` for comprehensive page discovery
4. **Deduplicate and validate** extracted contacts

## Multi-Platform Lead Enrichment

Combine LinkedIn data with other platforms:

**Pattern**: LinkedIn -> Company Website -> Instagram (for B2C)

1. Find prospect on LinkedIn
2. Get company website from LinkedIn company profile
3. Extract additional contacts from website
4. Check Instagram for business account (B2C companies)
5. Analyze social presence and engagement

## Boolean Search Patterns

**Title Combinations**:
- `"VP Sales" OR "Head of Sales" OR "Director Sales"` - Multiple title variations
- `"Software Engineer" AND "Python"` - Title + required skill
- `"Marketing" NOT "Intern"` - Exclude junior levels

**Company Patterns**:
- `"Google OR Meta OR Amazon"` - Multiple target companies
- `"SaaS" AND "B2B"` - Industry qualifiers

**Location Strategies**:
- `"San Francisco Bay Area"` - Metropolitan areas
- `"United States"` - Country-level

## Rate Limits and Best Practices

**Strategies for Large Datasets**:
1. **Batch Processing**: Use `count` parameter to limit results per call (25-50 at a time)
2. **Increase Timeout**: Use `request_timeout` parameter for complex queries (400-600 seconds)
3. **Parallel Processing**: Search multiple locations simultaneously

**Data Freshness**:
- LinkedIn data is real-time through anysite MCP
- Email database (`get_linkedin_user_email_db`) may have stale entries
- Use `find_linkedin_user_email` for current discovery, fall back to database

**Privacy and Compliance**:
- Respect LinkedIn's usage policies
- Comply with GDPR/CCPA requirements
- Only collect publicly available emails
- Provide opt-out mechanisms and maintain suppression lists

## Reference Documentation

- **[LINKEDIN_STRATEGIES.md](references/LINKEDIN_STRATEGIES.md)** - Advanced LinkedIn search patterns, Boolean operators, and targeting strategies
- **[WEB_SCRAPING.md](references/WEB_SCRAPING.md)** - Website contact extraction patterns, common page structures, and parsing techniques
- **[WORKFLOWS.md](references/WORKFLOWS.md)** - Detailed workflow examples, MCP tool parameters, lead scoring framework, and troubleshooting

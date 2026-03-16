# Web Scraping for Contact Extraction

Strategies and techniques for extracting contact information from company websites using anysite MCP.

## Overview

Web scraping complements LinkedIn lead generation by:
- Finding contacts not active on LinkedIn
- Discovering phone numbers and addresses
- Verifying email addresses
- Accessing information from company directories
- Getting regional office contacts

## Contact Extraction Tools

### parse_webpage

Primary tool for extracting contacts from web pages.

**Basic Usage**:
```
Tool: mcp__anysite__parse_webpage
Parameters:
- url: "https://company.com/contact"
- extract_contacts: true
- strip_all_tags: true
- only_main_content: true
```

**Returns**:
- Emails: All email addresses found
- Phones: Phone numbers in various formats
- Social links: LinkedIn, Twitter, Facebook, Instagram
- Content: Page text for additional parsing

### get_sitemap

Discover all pages on a website to find contact information.

**Basic Usage**:
```
Tool: mcp__anysite__get_sitemap
Parameters:
- url: "https://company.com"
- count: 100
```

## Common Page Patterns

### Contact Pages
Standard URLs: `/contact`, `/contact-us`, `/get-in-touch`, `/reach-us`

### About Pages
Standard URLs: `/about`, `/about-us`, `/who-we-are`, `/company`

### Team/People Pages
Standard URLs: `/team`, `/our-team`, `/people`, `/leadership`, `/about/team`

### Locations/Offices Pages
Standard URLs: `/locations`, `/offices`, `/contact/locations`

## Email Pattern Recognition

### Common Email Formats
```
first.last@company.com          (Most common)
first@company.com               (Small companies)
flast@company.com               (Medium companies)
firstl@company.com              (Larger companies)
first_last@company.com          (Underscore variant)
```

### Department Emails
```
sales@company.com
info@company.com
contact@company.com
support@company.com
careers@company.com
```

## Multi-Page Scraping Workflows

### Workflow 1: Comprehensive Company Contact Extraction

1. Get sitemap: `get_sitemap("https://company.com", count=100)`
2. Filter for relevant pages (contact, team, about, leadership)
3. Parse each relevant page with `extract_contacts=true`
4. Consolidate and deduplicate
5. Enrich with LinkedIn

### Workflow 2: Team Directory Scraping

1. Find team page (try common patterns or use sitemap)
2. Extract team members with `parse_webpage`
3. Parse individual profiles if available
4. Match to LinkedIn
5. Construct email addresses from detected patterns

### Workflow 3: Multi-Location Contact Extraction

1. Find locations page
2. Extract location information (addresses, phones, emails)
3. Parse location-specific pages
4. Find office leaders via LinkedIn
5. Build location contact sheet

## Integration with LinkedIn Data

### LinkedIn -> Web Enrichment
1. Find prospects on LinkedIn
2. Get company websites from LinkedIn company profiles
3. Extract company contacts from websites
4. Match web contacts to LinkedIn prospects
5. Build enriched prospect list

### Web -> LinkedIn Validation
1. Extract team from website
2. Search LinkedIn for each person
3. Validate and enrich with LinkedIn data
4. Cross-reference for accuracy
5. Build validated contact list

## Best Practices

### Efficiency
1. Start with sitemap to identify all relevant pages
2. Parse in batches of 5-10 websites at a time
3. Prioritize high-value pages (team, leadership) over generic contact pages
4. Use LinkedIn first for individual contacts, web scraping for company-level contacts

### Quality
1. Validate all contact data before using
2. Match emails to people when possible (vs. generic info@)
3. Check data freshness (recent LinkedIn activity = current employee)
4. Verify company domain matches website being scraped

### Compliance
1. Respect robots.txt and website terms of service
2. Rate limit requests to avoid overloading servers
3. Only collect publicly available contact information
4. Provide opt-out mechanism in all communications

---

**Next Steps**: Combine web scraping with LinkedIn strategies from [LINKEDIN_STRATEGIES.md](LINKEDIN_STRATEGIES.md) for comprehensive lead generation.

# Lead Generation Workflows & Tool Reference

## Workflow: Recruiter Candidate Sourcing

**Scenario**: Find qualified candidates for open positions

**Steps**:

1. **Define candidate profile**: Required skills, titles, experience level, location

2. **Search for candidates**
```
Tool: mcp__anysite__search_linkedin_users
Parameters:
- keywords: <technical skills, e.g., "Python React AWS">
- title: <relevant titles, e.g., "Software Engineer, Senior Engineer">
- location: <location or "Remote">
- count: 100
```

3. **Enrich candidate profiles**
```
For promising candidates:
Tool: mcp__anysite__get_linkedin_profile
Tool: mcp__anysite__get_linkedin_user_experience
Tool: mcp__anysite__get_linkedin_user_skills
Tool: mcp__anysite__get_linkedin_user_education
```

4. **Find contact information**
```
Tool: mcp__anysite__find_linkedin_user_email
Tool: mcp__anysite__get_linkedin_user_email_db
```

5. **Build candidate pipeline**: Score candidates on skills match, prioritize by experience, create outreach sequence

## MCP Tools Reference

### LinkedIn People Search
**Tool**: `mcp__anysite__search_linkedin_users`

**Parameters**:
- `keywords` (optional): General keywords for search
- `title` (optional): Job title keywords (e.g., "VP Sales", "Software Engineer")
- `company_keywords` (optional): Company name keywords
- `location` (optional): Location (city, state, country)
- `school_keywords` (optional): School/university keywords
- `first_name` (optional): First name
- `last_name` (optional): Last name
- `count` (default: 10): Number of results to return

**Returns**: List of user profiles with name, title, location, profile URL, and URN

### LinkedIn Profile Details
**Tool**: `mcp__anysite__get_linkedin_profile`

**Parameters**:
- `user` (required): LinkedIn username or full profile URL
- `with_education` (default: true): Include education history
- `with_experience` (default: true): Include work experience
- `with_skills` (default: true): Include skills

**Returns**: Complete profile with work history, education, skills, certifications

### Email Finding
**Tool**: `mcp__anysite__find_linkedin_user_email`

**Parameters**:
- `email` (required): Email address for reverse lookup
- `count` (default: 5): Number of results
- `request_timeout` (default: 300): Timeout in seconds

### Email Database Lookup
**Tool**: `mcp__anysite__get_linkedin_user_email_db`

**Parameters**:
- `profile` (required): LinkedIn profile URL
- `request_timeout` (default: 300): Timeout in seconds

### Company Search
**Tool**: `mcp__anysite__search_linkedin_companies`

**Parameters**:
- `keywords` (optional): Company name or description keywords
- `location` (optional): Company location
- `industry` (optional): Industry type
- `employee_count` (optional): Array of employee count ranges (e.g., ["51-200", "201-500"])
- `count` (required): Number of results to return

### Company Details
**Tool**: `mcp__anysite__get_linkedin_company`

**Parameters**:
- `company` (required): Company identifier or LinkedIn URL

### Company Employee Stats
**Tool**: `mcp__anysite__get_linkedin_company_employee_stats`

**Parameters**:
- `urn` (required): Company URN from company lookup

### Web Contact Extraction
**Tool**: `mcp__anysite__parse_webpage`

**Parameters**:
- `url` (required): Webpage URL
- `extract_contacts` (default: false): Extract emails, phones, social links
- `strip_all_tags` (default: true): Remove HTML tags
- `only_main_content` (default: true): Extract only main content area

### LinkedIn User Experience
**Tool**: `mcp__anysite__get_linkedin_user_experience`

**Parameters**:
- `urn` (required): User URN from search or profile
- `count` (default: 10): Number of experience entries

### LinkedIn User Skills
**Tool**: `mcp__anysite__get_linkedin_user_skills`

**Parameters**:
- `urn` (required): User URN
- `count` (default: 10): Number of skills to return

## Lead Scoring Framework

Score prospects based on multiple criteria:

**Profile Completeness** (0-20 points): Has email (+10), complete work history (+5), education (+3), skills (+2)
**Title Match** (0-30 points): Exact match (+30), similar (+20), related (+10)
**Company Fit** (0-25 points): Ideal size (+25), acceptable (+15), too small/large (+5)
**Experience Level** (0-15 points): 5-10 years (+15), 3-5 years (+10), 10+ years (+10), <3 years (+5)
**Location** (0-10 points): Target location (+10), acceptable (+5), remote (+8)

**Total Score**: 0-100 points
- **90-100**: Hot lead - Contact immediately
- **70-89**: Warm lead - High priority follow-up
- **50-69**: Qualified - Standard outreach
- **<50**: Unqualified - Nurture or discard

## Automated Prospect Enrichment

Systematic enrichment workflow for large lists:

1. **Initial Search**: Get 100-500 prospects from LinkedIn search
2. **First Filter**: Remove obviously unqualified (wrong title, location, etc.)
3. **Batch Enrichment**: Enrich top 50 prospects with full profiles
4. **Email Discovery**: Find emails for top 25 prospects
5. **Web Research**: Extract company contacts for remaining prospects
6. **Final Scoring**: Apply lead scoring framework
7. **Export**: Generate CSV for top-scored leads only

## Troubleshooting

### No Results from LinkedIn Search
- Broaden search criteria (remove some filters)
- Try location variations: "San Francisco", "San Francisco Bay Area", "SF"
- Use partial titles: "Sales" instead of "Vice President of Sales"
- Verify company names with `search_linkedin_companies` first

### Email Not Found
1. Try `get_linkedin_user_email_db` as alternative
2. Extract email from company website instead
3. Use email pattern guessing (firstname.lastname@company.com)
4. Check for email in LinkedIn profile "Contact Info" section

### Timeout Errors
- Reduce `count` parameter (try 25-50 instead of 100+)
- Increase `request_timeout` to 400-600 seconds
- Break large searches into multiple smaller searches

### Incomplete Profile Data
- Set `with_experience=true`, `with_education=true` explicitly
- Try getting detailed experience with `get_linkedin_user_experience`
- Accept incomplete data and supplement with web research

## Example Use Cases

### Enterprise SaaS Sales
1. Define ICP: VP/Director level, Enterprise Software, 500-5000 employees
2. Search LinkedIn with company and title filters
3. Filter by company size, enrich top 30 prospects
4. Find emails for top 20, export CSV for Salesforce

### Partnership Outreach
1. Search companies: `keywords="marketing automation" employee_count=["51-200"]`
2. Identify decision-makers: `title="VP Product OR Head of Partnerships"`
3. Research company details and recent posts
4. Multi-channel outreach: LinkedIn + email

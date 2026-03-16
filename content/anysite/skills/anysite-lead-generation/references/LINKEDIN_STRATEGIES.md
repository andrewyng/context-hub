# LinkedIn Lead Generation Strategies

Advanced strategies and best practices for LinkedIn prospecting using anysite MCP.

## Boolean Search Operators

### Basic Operators

**AND** - Both terms must be present
```
title:"Software Engineer" AND "Python"
```

**OR** - Either term must be present
```
title:"VP Sales" OR "Head of Sales" OR "Director Sales"
```

**NOT** - Exclude terms
```
title:"Marketing" NOT "Intern" NOT "Coordinator"
```

**Quotes** - Exact phrase match
```
title:"Chief Technology Officer"
```

**Parentheses** - Group logic
```
title:("VP" OR "Director") AND ("Sales" OR "Business Development")
```

### Advanced Search Patterns

#### Title Targeting

**Executive Level**:
```
title:(VP OR "Vice President" OR SVP OR EVP OR C-level OR Chief OR President)
```

**Management Level**:
```
title:(Director OR "Head of" OR Manager OR Lead) NOT (Assistant OR Associate)
```

**Individual Contributor**:
```
title:("Software Engineer" OR Developer OR Analyst) NOT (Manager OR Director OR Lead)
```

**Seniority Filters**:
```
title:(Senior OR Staff OR Principal OR Lead OR Architect)
```

#### Industry-Specific Patterns

**SaaS/Technology**:
```
company_keywords:(SaaS OR "Cloud Software" OR "Enterprise Software" OR B2B)
```

**Finance**:
```
company_keywords:("Investment Bank" OR "Private Equity" OR "Venture Capital" OR Fintech)
```

**Healthcare**:
```
company_keywords:(Healthcare OR "Health Tech" OR Medical OR Pharma OR Biotech)
```

**E-commerce/Retail**:
```
company_keywords:(E-commerce OR Retail OR "Consumer Products" OR DTC)
```

#### Location Strategies

**Metropolitan Areas**:
```
location:"San Francisco Bay Area"
location:"New York City Metropolitan Area"
location:"Greater Boston"
```

**Remote Work**:
```
location:(Remote OR "Work from Home" OR Distributed)
```

**Multi-Location Search**:
```
location:("San Francisco" OR "New York" OR "Austin" OR "Seattle")
```

**Country-Level**:
```
location:"United States"
location:"United Kingdom"
```

## ICP-Based Search Strategies

### Enterprise B2B SaaS

**Target Profile**: Decision-makers at mid-market to enterprise SaaS companies

**Search Strategy**:
```
Step 1: Find Companies
- keywords: "B2B SaaS" OR "Enterprise Software"
- employee_count: ["201-500", "501-1000", "1001-5000"]
- industry: "Computer Software"

Step 2: Find Decision-Makers
- company_keywords: <from step 1>
- title: "VP" OR "SVP" OR "Chief" OR "Head of"
- keywords: "Sales" OR "Revenue" OR "GTM" OR "Business Development"
```

**Refinement**:
- Filter for companies with recent funding (check YC or Crunchbase)
- Prioritize companies with 100+ LinkedIn followers
- Target specific verticals (HR Tech, Sales Tech, Marketing Tech)

### Startup Ecosystem

**Target Profile**: Founders and early employees at seed/Series A startups

**Search Strategy**:
```
Step 1: Find Startups (Y Combinator)
- search_yc_companies
- batches: Recent batches (W24, S23, W23)
- industries: <your target verticals>

Step 2: Find Founders
- get_yc_company -> Extract founder LinkedIn profiles
- title: "Founder" OR "Co-Founder" OR "CEO"

Step 3: Find Early Team
- company_keywords: <startup names from step 1>
- title: "Head of" OR "VP" OR "Lead"
- Filter for <50 total employees
```

**Refinement**:
- Target companies that recently raised funding
- Focus on specific YC batches or industries
- Look for hiring signals (job postings, team growth)

### Agency/Services

**Target Profile**: Agency owners and service providers

**Search Strategy**:
```
Step 1: Find Agencies
- keywords: "Agency" OR "Services" OR "Consulting"
- employee_count: ["11-50", "51-200"]
- industry: <specific agency type>

Step 2: Find Owners/Principals
- title: "Owner" OR "Founder" OR "Principal" OR "Managing Director"
- company_keywords: <agency names>
```

**Refinement**:
- Target specific agency types (Marketing, Design, Development)
- Filter by client focus (B2B vs B2C)
- Look for agencies with strong LinkedIn presence

## Search Workflow Optimization

### Funnel Approach

**Stage 1: Broad Search** (500+ prospects)
- Cast wide net with general criteria
- Focus on title and location only
- Identify target companies

**Stage 2: Company Filtering** (200-300 prospects)
- Research target companies
- Filter by company size, industry, funding
- Remove obviously poor fits

**Stage 3: Title Refinement** (100-150 prospects)
- Narrow to specific decision-maker titles
- Filter by seniority level
- Prioritize by title match

**Stage 4: Profile Enrichment** (50-75 prospects)
- Get full LinkedIn profiles
- Review work history and education
- Score based on qualification criteria

**Stage 5: Email Discovery** (25-40 prospects)
- Find verified emails
- Extract website contacts
- Validate email addresses

**Stage 6: Final Qualification** (15-25 prospects)
- Deep research on top prospects
- Personalization research
- Ready for outreach

### Batch Processing Strategy

**Batch Size Guidelines**:
- **Initial Search**: 50-100 prospects per batch
- **Profile Enrichment**: 10-20 profiles per batch
- **Email Finding**: 5-10 lookups per batch
- **Website Scraping**: 5-10 websites per batch

**Timing Between Batches**:
- Wait 30-60 seconds between large searches
- Process enrichment results before next batch
- Review quality before scaling up

**Parallel Processing**:
- Search multiple locations simultaneously
- Enrich different cohorts in parallel
- Extract contacts from multiple websites at once

Example:
```
Parallel Batch 1:
- search_linkedin_users(location="San Francisco", count=50)
- search_linkedin_users(location="New York", count=50)
- search_linkedin_users(location="Austin", count=50)

After review, Parallel Batch 2:
- Enrich top 10 from San Francisco
- Enrich top 10 from New York
- Enrich top 10 from Austin
```

## Qualification Frameworks

### BANT Framework (Budget, Authority, Need, Timeline)

**Budget** - Company size and funding
```
Check:
- Employee count (proxy for budget)
- Recent funding rounds (via YC or company posts)
- Company description for "Enterprise" or "SMB"
```

**Authority** - Decision-making power
```
Target titles:
- C-level: Final decision maker
- VP/SVP: Budget authority
- Director: Influencer/user
- Manager: User/champion
```

**Need** - Problem awareness
```
Research:
- LinkedIn posts about challenges
- Job postings for relevant roles
- Company growth signals
- Industry trends
```

**Timeline** - Buying readiness
```
Indicators:
- Recently joined company (new priorities)
- Job posting for related role
- Company expansion news
- Fiscal calendar alignment
```

### Lead Scoring Model

**Profile Score (40 points)**:
- Exact title match: 20 points
- Similar title: 15 points
- Right department: 10 points
- Related role: 5 points

**Company Score (30 points)**:
- Ideal company size: 15 points
- Right industry: 10 points
- Growth signals: 5 points

**Engagement Score (20 points)**:
- Active on LinkedIn: 10 points
- Recent posts: 5 points
- Profile completeness: 5 points

**Contact Score (10 points)**:
- Email found: 10 points
- Phone found: 5 points
- No contact: 0 points

**Total**: 0-100 points
- **80-100**: Immediate outreach
- **60-79**: High priority
- **40-59**: Qualified
- **<40**: Nurture or discard

## Personalization Research

### Profile Intelligence

**Work History**:
```
get_linkedin_profile + with_experience: true

Extract:
- Career progression (promotions, moves)
- Company tenure (job hopper vs. stable)
- Industry experience
- Skill development path
```

**Education**:
```
get_linkedin_profile + with_education: true

Look for:
- Alma mater (school connections)
- Degree relevance to your solution
- Certifications (continuous learning)
- Shared education background
```

### Company Intelligence

**Company Profile**:
```
get_linkedin_company

Analyze:
- Company description (positioning)
- Industry and specialties
- Employee count trend
- Headquarters location
```

**Recent Activity**:
```
get_linkedin_company_posts

Review:
- Announcement posts (expansion, funding, hiring)
- Thought leadership topics
- Engagement levels
- Company culture signals
```

## Email Discovery Strategies

### LinkedIn Email Methods

**Method 1**: Direct Email Finding
```
find_linkedin_user_email(email="prospect@company.com")
```

**Method 2**: Database Lookup
```
get_linkedin_user_email_db(profile="linkedin.com/in/prospect")
```

**Method 3**: Contact Info Section
```
get_linkedin_profile(user, with_experience=true)
-> Check profile for contact info section
-> May include email, phone, website
```

### Website Email Extraction

**Contact Page Pattern**:
```
parse_webpage(
  url="https://company.com/contact",
  extract_contacts=true
)

Common contact pages:
- /contact
- /contact-us
- /about/contact
- /get-in-touch
- /reach-us
```

### Email Pattern Guessing

**Common Patterns**:
```
first.last@company.com (most common)
first@company.com
flast@company.com
firstl@company.com
first_last@company.com
```

## CRM Integration Patterns

### Salesforce Import Format

**Required Fields**:
```csv
First Name,Last Name,Email,Company,Title,Phone,LinkedIn URL
Jane,Smith,jane@tech.com,TechCorp,VP Sales,415-555-1234,linkedin.com/in/janesmith
```

### HubSpot Import Format

**Contact Properties**:
```csv
Email,First Name,Last Name,Job Title,Company Name,LinkedIn Profile URL,Lead Score,Lifecycle Stage
jane@tech.com,Jane,Smith,VP Sales,TechCorp,linkedin.com/in/janesmith,85,Sales Qualified Lead
```

## Compliance & Best Practices

### GDPR Compliance

- Only collect publicly available information
- Document lawful basis for processing
- Provide data subject rights (access, deletion)
- Maintain data processing records
- Encrypt data at rest and in transit

### CAN-SPAM Compliance

- Accurate "From" name and email
- Truthful subject lines
- Include physical mailing address
- Provide clear opt-out mechanism
- Honor opt-outs within 10 business days

### LinkedIn Usage Policies

**Do's**:
- Respect connection limits (100-200/week max)
- Personalize connection requests
- Engage authentically with content
- Use data for legitimate business purposes

**Don'ts**:
- Don't automate connection requests
- Don't send mass generic messages
- Don't scrape private profile information
- Don't circumvent LinkedIn's limits

---

**Next Steps**: Apply these strategies to your lead generation workflows, and refer to [WEB_SCRAPING.md](WEB_SCRAPING.md) for website contact extraction techniques.

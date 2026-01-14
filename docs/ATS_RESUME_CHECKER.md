# ATS Resume Checker - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [What is ATS?](#what-is-ats)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [How to Use](#how-to-use)
6. [Understanding Your Score](#understanding-your-score)
7. [Category Breakdown](#category-breakdown)
8. [Acting on Feedback](#acting-on-feedback)
9. [API Documentation](#api-documentation)
10. [Best Practices](#best-practices)
11. [Common Issues](#common-issues)
12. [Industry Keywords](#industry-keywords)
13. [Examples](#examples)
14. [FAQ](#faq)

---

## Overview

The ATS Resume Checker is an AI-powered tool that analyzes your resume for compatibility with Applicant Tracking Systems (ATS). It provides a comprehensive score, detailed feedback, and actionable suggestions to help you optimize your resume for automated screening systems used by employers.

### Why ATS Matters

- **90%** of large companies use ATS to screen resumes
- **75%** of resumes are rejected by ATS before a human sees them
- **Well-optimized resumes** have 2-3x higher callback rates
- **ATS-friendly formatting** is essential for modern job applications

### Key Benefits

✅ **Instant Analysis**: Get your ATS score in 10-15 seconds  
✅ **Detailed Feedback**: Category-specific scores and suggestions  
✅ **Missing Keywords**: Identify industry terms to add  
✅ **Priority Levels**: Focus on high-impact improvements first  
✅ **Track Progress**: Re-check to see score improvements  
✅ **AI-Powered**: Uses Mistral AI for intelligent analysis  

---

## What is ATS?

**ATS (Applicant Tracking System)** is software used by employers to:
- Automatically scan and parse resumes
- Search for specific keywords and qualifications
- Rank candidates based on relevance
- Filter out unqualified applicants

### How ATS Works

1. **Parsing**: Extracts text from your resume
2. **Keyword Matching**: Searches for relevant terms
3. **Scoring**: Ranks candidates based on match percentage
4. **Filtering**: Only top-scoring resumes reach recruiters

### Common ATS Software

- **Workday**: Used by Fortune 500 companies
- **Taleo**: Oracle's ATS platform
- **Greenhouse**: Popular with tech companies
- **Lever**: Modern ATS system
- **iCIMS**: Enterprise recruitment platform
- **BambooHR**: Small to mid-size companies

---

## Features

### 🎯 Overall ATS Score (0-100)

Get a comprehensive compatibility score:
- **80-100**: Excellent - Ready to submit
- **60-79**: Good - Minor improvements needed
- **40-59**: Fair - Several issues to address
- **0-39**: Poor - Major restructuring required

### 📊 Category Breakdown

**1. Formatting (0-100)**
- Evaluates: Structure, simplicity, parseability
- Checks: Tables, graphics, columns, fonts
- Goal: Clean, linear layout

**2. Keywords (0-100)**
- Evaluates: Industry terms, technical skills
- Checks: Action verbs, relevant buzzwords
- Goal: Natural keyword integration

**3. Content (0-100)**
- Evaluates: Achievements, clarity, impact
- Checks: Quantifiable metrics, action verbs
- Goal: Results-driven descriptions

**4. Structure (0-100)**
- Evaluates: Organization, consistency
- Checks: Sections, dates, headings
- Goal: Standard resume format

### ✨ Additional Features

- **Strengths Analysis**: What's working well
- **Missing Keywords**: Terms to add naturally
- **Prioritized Improvements**: High/Medium/Low priority
- **Actionable Suggestions**: Specific fixes for each issue
- **Re-check Capability**: Track improvements over time

---

## Quick Start

### Prerequisites

✅ Resume Builder access  
✅ At least some experience or education filled in  
✅ Mistral AI API key configured (backend)  

### 3 Steps to Check Your Resume

**Step 1: Fill Your Resume**
- Add your experience, education, and skills
- Include as much detail as possible

**Step 2: Click "Check ATS"**
- Purple shield button in Resume Builder
- Wait 10-15 seconds for analysis

**Step 3: Review Results**
- View your score and feedback
- Read prioritized suggestions
- Make improvements and re-check

---

## How to Use

### Step-by-Step Guide

#### 1. Prepare Your Resume

**Minimum Requirements**:
- At least 1 experience entry OR 1 education entry
- Some skills listed
- Contact information (recommended)

**Recommended for Better Analysis**:
```
✅ Personal Information (name, email, phone, LinkedIn)
✅ Professional Summary
✅ 2-3 Work Experience entries with descriptions
✅ Education details
✅ 5-10 relevant skills
✅ Projects (optional but helpful)
```

#### 2. Access ATS Checker

**Location**: Resume Builder page

**Button**: Purple "Check ATS" button with shield icon

**Position**: Between "Save as Draft" and "Download PDF"

#### 3. Wait for Analysis

- Processing time: 10-15 seconds (usually)
- Maximum timeout: 50 seconds
- Status: "Checking ATS..." displayed

#### 4. Review Results Modal

The modal displays:

**Header Section**:
- Shield icon
- "ATS Compatibility Report" title
- Close button (X)

**Overall Score Section**:
- Large score number (0-100)
- Color-coded (green/yellow/red)
- Rating badge (Excellent/Good/Fair/Poor)
- Summary text

**Category Breakdown**:
- Four category cards
- Individual scores with color coding
- Specific feedback for each
- Missing keywords (if applicable)

**Strengths Section**:
- Checkmark icon
- List of positive aspects
- What you're doing right

**Improvements Section**:
- Alert icon
- Prioritized list of issues
- Specific suggestions for each
- Priority badges (High/Medium/Low)

#### 5. Take Action

**Immediate Actions**:
1. Focus on HIGH priority items first
2. Add missing keywords naturally
3. Fix formatting issues
4. Improve content with metrics

**After Changes**:
1. Click "Check ATS" again
2. Compare new score to old score
3. Verify improvements were effective
4. Iterate until score is 70+

---

## Understanding Your Score

### Overall Score Ranges

| Score | Rating | Icon | Meaning | Action Required |
|-------|--------|------|---------|-----------------|
| 80-100 | Excellent | 🟢 | Highly ATS-compatible | Minor polish only |
| 60-79 | Good | 🟡 | Generally compatible | Address medium priority |
| 40-59 | Fair | 🟠 | Needs improvement | Fix high priority items |
| 0-39 | Poor | 🔴 | Major issues | Complete restructure |

### What Each Score Means

#### 80-100: Excellent ⭐⭐⭐

**What this means**:
- Your resume is highly optimized for ATS
- Should pass through most screening systems
- Formatting is clean and parseable
- Contains relevant keywords
- Shows quantifiable achievements

**Next steps**:
- Review low-priority suggestions
- Tailor to specific job descriptions
- Submit with confidence

**Expected outcomes**:
- High callback rate (15-25%)
- Resume reaches human recruiters
- Strong first impression

---

#### 60-79: Good ⭐⭐

**What this means**:
- Your resume is generally ATS-friendly
- May have minor parsing issues
- Missing some relevant keywords
- Content could be stronger

**Next steps**:
- Address high and medium priority items
- Add missing keywords naturally
- Improve quantifiable metrics
- Re-check to reach 80+

**Expected outcomes**:
- Moderate callback rate (10-15%)
- Most resumes pass initial screening
- Some improvements needed for optimal results

---

#### 40-59: Fair ⭐

**What this means**:
- Resume has several ATS compatibility issues
- May not parse correctly in some systems
- Missing important keywords
- Content needs strengthening

**Next steps**:
- Focus on high priority fixes immediately
- Restructure formatting if needed
- Add industry-specific keywords
- Improve all descriptions with metrics
- Re-check after each major change

**Expected outcomes**:
- Low callback rate (5-10%)
- May be filtered out by strict ATS
- Significant improvements needed

---

#### 0-39: Poor ❌

**What this means**:
- Resume has major ATS compatibility problems
- Likely will not parse correctly
- Missing most relevant keywords
- Poor structure and formatting

**Next steps**:
- Complete resume restructure needed
- Remove all complex formatting
- Use standard section headings
- Add comprehensive keyword coverage
- Rewrite all content with action verbs
- Consider using Resume Builder's AI generation first

**Expected outcomes**:
- Very low callback rate (<5%)
- Likely filtered out by ATS
- Major overhaul required

---

## Category Breakdown

### 1. Formatting Score

**What's Evaluated**:
- Resume structure and layout
- Use of tables, columns, graphics
- Font choices and consistency
- Header/footer usage
- Text box usage
- Special characters

**High Score (80-100)**:
```
✅ Simple, linear layout
✅ Standard fonts (Arial, Calibri, Times New Roman)
✅ No tables or columns
✅ No graphics or images with text
✅ Clear section divisions
✅ Consistent spacing
```

**Low Score (<60)**:
```
❌ Complex multi-column layouts
❌ Tables for content organization
❌ Graphics, charts, or images
❌ Unusual fonts or symbols
❌ Text in headers/footers
❌ Text boxes or shapes
```

**How to Improve**:

1. **Remove Complex Elements**:
   ```
   Before: Resume in 2-column layout with graphics
   After:  Simple single-column text layout
   ```

2. **Use Standard Fonts**:
   ```
   ❌ Comic Sans, Papyrus, Script fonts
   ✅ Arial, Calibri, Times New Roman, Helvetica
   ```

3. **Eliminate Tables**:
   ```
   Before: Skills in table format
   After:  Skills: JavaScript, Python, React, Node.js
   ```

4. **Move Header Info**:
   ```
   Before: Contact info in header/footer
   After:  Contact info at top of main body
   ```

---

### 2. Keywords Score

**What's Evaluated**:
- Industry-relevant terminology
- Technical skills and tools
- Methodologies and frameworks
- Action verbs
- Job-specific buzzwords

**High Score (80-100)**:
```
✅ Includes industry-specific terms
✅ Technical skills clearly listed
✅ Methodologies mentioned (Agile, Scrum, etc.)
✅ Strong action verbs throughout
✅ Both acronyms and full terms
✅ Natural keyword integration
```

**Low Score (<60)**:
```
❌ Generic descriptions
❌ Missing technical terminology
❌ No methodology mentions
❌ Weak, passive language
❌ Only acronyms OR only full terms
❌ Keyword stuffing
```

**Missing Keywords Section**:

The checker identifies specific keywords you should add:

**Example**:
```json
"missingKeywords": [
  "agile",
  "scrum",
  "CI/CD",
  "microservices",
  "cloud computing"
]
```

**How to Add Keywords Naturally**:

❌ **Wrong** (Keyword Stuffing):
```
Skills: Python Java JavaScript agile scrum CI/CD microservices 
cloud AWS Docker Kubernetes REST API GraphQL
```

✅ **Right** (Natural Integration):
```
Experience:
"Developed microservices using Python and Docker, deployed on 
AWS cloud infrastructure. Implemented CI/CD pipeline using 
Jenkins. Worked in agile team following scrum methodology."
```

**Action Verbs by Category**:

**Leadership**: Led, Managed, Directed, Supervised, Coordinated, Mentored
**Achievement**: Achieved, Improved, Increased, Reduced, Optimized, Streamlined
**Creation**: Developed, Built, Created, Designed, Implemented, Established
**Analysis**: Analyzed, Evaluated, Assessed, Investigated, Researched, Examined
**Collaboration**: Collaborated, Partnered, Coordinated, Facilitated, Liaised

---

### 3. Content Score

**What's Evaluated**:
- Quantifiable achievements
- Clarity and conciseness
- Impact demonstration
- Specific examples
- Results-oriented language

**High Score (80-100)**:
```
✅ Numbers and percentages included
✅ Clear, specific descriptions
✅ Demonstrates impact and results
✅ Action verbs at start of bullets
✅ Concise but comprehensive
✅ No jargon or unclear terms
```

**Low Score (<60)**:
```
❌ Vague, generic descriptions
❌ No quantifiable metrics
❌ Passive voice used
❌ Duties-focused instead of achievements
❌ Overly long paragraphs
❌ Unclear or confusing language
```

**Before & After Examples**:

**Example 1: Software Developer**
```
❌ Before (Score: 40):
"Responsible for coding and fixing bugs. Worked on various 
projects. Helped team members when needed."

✅ After (Score: 85):
"Developed and deployed 12 full-stack applications serving 
50,000+ users. Reduced bug count by 60% through implementation 
of automated testing. Mentored 3 junior developers, improving 
team velocity by 25%."
```

**Example 2: Marketing Manager**
```
❌ Before (Score: 35):
"Managed social media accounts. Created content for campaigns. 
Analyzed performance metrics."

✅ After (Score: 88):
"Led social media strategy across 5 platforms, growing follower 
base by 150% (10K to 25K). Created 50+ content pieces resulting 
in 300% engagement increase. Analyzed campaign data to optimize 
ROI, achieving 40% cost reduction while maintaining leads."
```

**Example 3: Project Manager**
```
❌ Before (Score: 42):
"Managed projects and coordinated with teams. Handled budgets 
and timelines. Communicated with stakeholders."

✅ After (Score: 82):
"Managed 8 concurrent projects with combined budget of $2M, 
delivering all on-time and under budget by average of 12%. 
Coordinated cross-functional teams of 15-20 members across 
4 departments. Improved stakeholder satisfaction scores from 
72% to 94% through weekly communication cadence."
```

---

### 4. Structure Score

**What's Evaluated**:
- Standard section organization
- Chronological order
- Date consistency
- Heading clarity
- Information completeness

**High Score (80-100)**:
```
✅ Standard section headings
✅ Chronological work history
✅ Consistent date formatting
✅ Clear job titles and companies
✅ All necessary sections present
✅ Logical information flow
```

**Low Score (<60)**:
```
❌ Non-standard or creative headings
❌ Inconsistent date formats
❌ Missing important sections
❌ Unclear job progression
❌ Information gaps
❌ Poor organization
```

**Standard Resume Structure**:

```markdown
[Your Name]
[Email] | [Phone] | [LinkedIn] | [Location]

PROFESSIONAL SUMMARY
2-3 sentences highlighting key qualifications

PROFESSIONAL EXPERIENCE
Job Title | Company Name | Month YYYY - Month YYYY
• Achievement with quantifiable result
• Achievement with quantifiable result
• Achievement with quantifiable result

Job Title | Company Name | Month YYYY - Month YYYY
• Achievement with quantifiable result
• Achievement with quantifiable result

EDUCATION
Degree, Major | University Name | Year
GPA: X.X (if 3.5+)

TECHNICAL SKILLS
Category: Skill1, Skill2, Skill3
Category: Skill1, Skill2, Skill3

PROJECTS (Optional)
Project Name | Technologies Used
Brief description with outcome
```

**Date Format Consistency**:

✅ **Consistent Examples**:
```
Jan 2022 - Present
Jun 2020 - Dec 2021
Mar 2018 - May 2020

OR

01/2022 - Present
06/2020 - 12/2021
03/2018 - 05/2020
```

❌ **Inconsistent Examples**:
```
January 2022 - Now          (Mixed formats)
6/20 - 12/2021              (Inconsistent year format)
March 2018 to May 2020      (Different separator)
```

---

## Acting on Feedback

### Priority System

#### 🔴 High Priority
**Impact**: Critical issues that prevent ATS parsing  
**Action**: Fix immediately before any other changes  
**Timeline**: Address within 1 day

**Common High Priority Issues**:
- Missing contact information
- Complex tables or graphics
- No standard section headings
- Inconsistent or missing dates
- Resume not parseable
- Critical keywords missing

**Example**:
```
Issue: "Resume uses table layout which ATS cannot parse"
Suggestion: "Convert table layout to simple text format with 
clear section headings"
Priority: HIGH

Action: Remove all tables, use plain text sections
```

---

#### 🟡 Medium Priority
**Impact**: Reduces effectiveness but doesn't break parsing  
**Action**: Address after high priority, before submission  
**Timeline**: Address within 2-3 days

**Common Medium Priority Issues**:
- Missing industry keywords
- Weak action verbs
- Lack of quantifiable achievements
- Inconsistent formatting
- Incomplete sections

**Example**:
```
Issue: "Missing important technical keywords"
Suggestion: "Add terms like 'CI/CD', 'microservices', and 
'cloud computing' naturally in experience descriptions"
Priority: MEDIUM

Action: Integrate keywords into bullet points
```

---

#### 🔵 Low Priority
**Impact**: Nice to have, minimal effect on ATS score  
**Action**: Optional improvements for polish  
**Timeline**: Address if time permits

**Common Low Priority Issues**:
- Summary could be more concise
- Minor formatting inconsistencies
- Additional skills to highlight
- Order of sections
- Length optimization

**Example**:
```
Issue: "Professional summary is slightly long"
Suggestion: "Condense to 2-3 sentences focusing on top achievements"
Priority: LOW

Action: Edit when polishing final version
```

---

### Improvement Workflow

#### Phase 1: Quick Wins (Day 1)

**Focus**: High-impact, easy fixes

1. **Fix Formatting**:
   - Remove tables, columns, graphics
   - Use standard fonts
   - Add clear section headings

2. **Ensure Consistency**:
   - Standardize date formats
   - Check all sections are present
   - Verify contact info

3. **Run Initial Re-check**:
   - See immediate score improvement
   - Verify changes were effective

**Expected Result**: Score increase of 10-20 points

---

#### Phase 2: Keyword Optimization (Day 2-3)

**Focus**: Adding missing keywords naturally

1. **Review Missing Keywords**:
   - Note all suggested terms
   - Prioritize most relevant to target job
   - Plan where to integrate each

2. **Integrate Naturally**:
   ```
   Before: "Worked on web development"
   After: "Developed responsive web applications using React, 
   Node.js, and MongoDB in agile environment"
   ```

3. **Re-check**:
   - Verify keywords were recognized
   - Check keywords score improvement

**Expected Result**: Keywords score +15-25 points

---

#### Phase 3: Content Enhancement (Day 3-4)

**Focus**: Strengthening descriptions

1. **Add Quantifiable Metrics**:
   ```
   Before: "Improved system performance"
   After: "Improved system performance by 45%, reducing response 
   time from 2.5s to 1.4s"
   ```

2. **Use Strong Action Verbs**:
   ```
   Before: "Was responsible for managing team"
   After: "Led and mentored team of 5 developers"
   ```

3. **Highlight Impact**:
   ```
   Before: "Created marketing campaigns"
   After: "Designed and executed 12 marketing campaigns, 
   generating $500K in new revenue (25% increase YoY)"
   ```

4. **Re-check**:
   - Verify content score improvement
   - Check overall score

**Expected Result**: Content score +10-20 points

---

#### Phase 4: Final Polish (Day 4-5)

**Focus**: Medium and low priority items

1. **Address Remaining Issues**:
   - Medium priority improvements
   - Low priority suggestions if time permits

2. **Tailor to Job Description**:
   - Add specific keywords from job posting
   - Emphasize relevant experience
   - Match required qualifications

3. **Final Re-check**:
   - Aim for score of 80+
   - Verify all high priority items resolved

4. **Get Second Opinion**:
   - Alumni review
   - Peer feedback
   - External ATS tools (Jobscan)

**Expected Result**: Overall score 75-85+

---

### Tracking Progress

**Progress Tracker Template**:

| Date | Check # | Overall | Formatting | Keywords | Content | Structure | Changes Made |
|------|---------|---------|------------|----------|---------|-----------|--------------|
| Jan 14 | 1 | 58 | 65 | 48 | 62 | 55 | Baseline |
| Jan 14 | 2 | 68 | 85 | 52 | 65 | 70 | Removed tables, fixed dates |
| Jan 15 | 3 | 74 | 85 | 68 | 70 | 73 | Added keywords naturally |
| Jan 16 | 4 | 82 | 88 | 75 | 82 | 83 | Added metrics, strong verbs |
| Jan 17 | 5 | 87 | 90 | 82 | 88 | 88 | Final polish |

**Progress Chart**:
```
90 |                                    ●
85 |                               ●
80 |                          ●
75 |                     ●
70 |                ●
65 |           ●
60 |      ●
55 |  ●
50 |___________________________________
    1   2   3   4   5   6   7   8   9
           Check Number
```

---

## API Documentation

### Endpoint

```http
POST /api/resume/ats-check
```

### Authentication

**Required**: Yes (JWT Bearer token)

**Header**:
```http
Authorization: Bearer <your_jwt_token>
```

### Request

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string"
  },
  "summary": "string",
  "content": {
    "experience": [
      {
        "title": "string",
        "company": "string",
        "duration": "string",
        "description": "string"
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "year": "string",
        "gpa": "string"
      }
    ],
    "skills": ["string"],
    "projects": [
      {
        "title": "string",
        "description": "string",
        "link": "string"
      }
    ]
  }
}
```

**Required Fields**:
- Must provide at least `content.experience` OR `content.education`
- All other fields are optional but recommended

**Example Request**:
```json
{
  "personalInfo": {
    "name": "Jane Smith",
    "email": "jane.smith@email.com",
    "phone": "+1 (555) 123-4567",
    "linkedin": "linkedin.com/in/janesmith"
  },
  "summary": "Full-stack developer with 4 years of experience building scalable web applications. Proficient in React, Node.js, and AWS. Reduced application load time by 50% and led team of 3 developers.",
  "content": {
    "experience": [
      {
        "title": "Senior Software Engineer",
        "company": "TechCorp Inc",
        "duration": "Jan 2022 - Present",
        "description": "Led development of microservices architecture serving 100K+ users. Implemented CI/CD pipeline reducing deployment time by 70%. Mentored 3 junior developers."
      },
      {
        "title": "Software Developer",
        "company": "StartupXYZ",
        "duration": "Jun 2020 - Dec 2021",
        "description": "Developed RESTful APIs using Node.js and Express. Built responsive frontends with React. Improved application performance by 45%."
      }
    ],
    "education": [
      {
        "degree": "B.S. Computer Science",
        "institution": "State University",
        "year": "2020",
        "gpa": "3.8"
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "REST APIs"],
    "projects": [
      {
        "title": "E-commerce Platform",
        "description": "Built full-stack e-commerce site with payment processing, inventory management, and analytics dashboard. Handles 5K+ transactions monthly.",
        "link": "github.com/janesmith/ecommerce"
      }
    ]
  }
}
```

### Response

**Success Response (200 OK)**:

```json
{
  "success": true,
  "message": "ATS compatibility check completed",
  "data": {
    "overallScore": 85,
    "categories": {
      "formatting": {
        "score": 90,
        "feedback": "Excellent clean formatting detected..."
      },
      "keywords": {
        "score": 82,
        "feedback": "Strong keyword usage...",
        "missingKeywords": ["agile", "scrum", "kubernetes"]
      },
      "content": {
        "score": 88,
        "feedback": "Excellent use of quantifiable achievements..."
      },
      "structure": {
        "score": 80,
        "feedback": "Well-organized with standard sections..."
      }
    },
    "strengths": [
      "Strong action verbs used throughout",
      "Quantifiable achievements included",
      "Clear chronological work history"
    ],
    "improvements": [
      {
        "issue": "Missing agile methodology keywords",
        "suggestion": "Add 'agile', 'scrum' to experience descriptions",
        "priority": "high"
      }
    ],
    "atsRating": "good",
    "summary": "Your resume is well-optimized for ATS systems..."
  }
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Please provide resume content for ATS analysis."
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "ATS Check Failed: Mistral API key not configured"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `overallScore` | number | 0-100 compatibility score |
| `categories.formatting.score` | number | Formatting score 0-100 |
| `categories.keywords.score` | number | Keywords score 0-100 |
| `categories.keywords.missingKeywords` | string[] | Keywords to add |
| `categories.content.score` | number | Content quality 0-100 |
| `categories.structure.score` | number | Structure score 0-100 |
| `strengths` | string[] | Positive aspects |
| `improvements` | object[] | Issues and suggestions |
| `improvements[].priority` | string | "high" \| "medium" \| "low" |
| `atsRating` | string | "excellent" \| "good" \| "fair" \| "poor" |
| `summary` | string | Overall assessment |

### Rate Limits

- **Rate**: No specific limit
- **Timeout**: 50 seconds
- **Recommendation**: Wait for response before re-checking

### Frontend Usage Example

```javascript
const checkATSCompatibility = async (resumeData) => {
  try {
    setLoading(true);
    
    const response = await api.post('/resume/ats-check', {
      personalInfo: resumeData.personalInfo,
      summary: resumeData.summary,
      content: resumeData.content
    });
    
    if (response.data.success) {
      const atsResults = response.data.data;
      
      console.log('ATS Score:', atsResults.overallScore);
      console.log('Rating:', atsResults.atsRating);
      
      // Display results in modal
      setAtsResults(atsResults);
      setShowModal(true);
    }
  } catch (error) {
    console.error('ATS check failed:', error);
    alert(error.response?.data?.message || 'Failed to check ATS');
  } finally {
    setLoading(false);
  }
};
```

---

## Best Practices

### Before You Start

1. **Research Target Jobs**
   - Read 5-10 job descriptions in your field
   - Note common keywords and requirements
   - Identify patterns in language used
   - Create keyword list to include

2. **Understand Your Industry**
   - Learn standard terminology
   - Know common tools and technologies
   - Understand typical qualifications
   - Research company cultures

### During Resume Creation

1. **Use Standard Formatting**
   ```
   ✅ Simple single-column layout
   ✅ Standard fonts (Arial, Calibri, Times New Roman)
   ✅ Clear section headings
   ✅ Consistent spacing
   ✅ No tables, graphics, or columns
   ```

2. **Write for Both ATS and Humans**
   ```
   ATS needs: Keywords, standard format, clear structure
   Humans need: Compelling stories, achievements, personality
   
   Solution: Use keywords naturally within achievement stories
   ```

3. **Quantify Everything**
   ```
   Numbers to include:
   • Percentages (improved by 40%)
   • Dollar amounts ($500K revenue increase)
   • Time saved (reduced from 2 hours to 15 minutes)
   • Team sizes (managed 7 developers)
   • User counts (serving 50,000+ users)
   • Frequency (weekly, daily, monthly)
   ```

4. **Include Both Forms of Terms**
   ```
   First mention: "Search Engine Optimization (SEO)"
   Later: "SEO strategies" or "Search Engine Optimization"
   
   Why: ATS searches for both acronyms and full terms
   ```

### ATS Checker Usage

1. **Check Early and Often**
   ```
   ✅ After initial draft
   ✅ After each major revision
   ✅ Before requesting alumni review
   ✅ Before submitting to jobs
   ✅ When changing industries
   ```

2. **Focus on High ROI Changes**
   ```
   High ROI:
   • Fixing formatting issues (quick, big impact)
   • Adding missing high-priority keywords
   • Standardizing dates and headings
   
   Lower ROI:
   • Minor wording changes
   • Reordering sections
   • Small format adjustments
   ```

3. **Track Your Progress**
   - Document initial score
   - Note each change made
   - Re-check after changes
   - Aim for 10-15 point improvement per iteration
   - Target final score of 80+

### Keyword Strategy

1. **Natural Integration**
   ```
   ❌ Keyword stuffing:
   "Python Java JavaScript React Node.js AWS Docker Git"
   
   ✅ Natural integration:
   "Developed Python-based APIs and React frontends, deployed 
   on AWS using Docker containers, managed via Git"
   ```

2. **Context Matters**
   ```
   ❌ Just listing: "Machine Learning"
   
   ✅ In context: "Built machine learning models achieving 
   92% accuracy, processing 10M+ data points daily"
   ```

3. **Verb + Keyword + Result**
   ```
   Formula: [Action Verb] + [Keywords] + [Quantifiable Result]
   
   Examples:
   "Implemented CI/CD pipeline, reducing deployment time by 70%"
   "Led agile team using scrum, delivering 8 projects on-time"
   "Developed microservices in AWS, serving 100K+ daily users"
   ```

### Common Mistakes to Avoid

| Mistake | Impact | Solution |
|---------|--------|----------|
| Using tables for layout | ATS parsing fails | Use simple text sections |
| Graphics with text | Text not readable | Use plain text only |
| Info in headers/footers | Often ignored | Put in main body |
| Only acronyms | Misses full term searches | Include both forms |
| Keyword stuffing | Looks unnatural | Integrate contextually |
| No metrics | Weak impact | Add numbers everywhere |
| Passive voice | Less impactful | Use action verbs |
| Inconsistent dates | Confusing | Standardize format |
| Missing sections | Incomplete view | Add all standard sections |
| Too long (>2 pages) | Key info missed | Condense to 1-2 pages |

---

## Common Issues

### Issue 1: Low Overall Score Despite Good Content

**Symptoms**:
- Content seems strong but score is low
- Feedback mentions formatting issues
- Formatting score < 60

**Causes**:
- Using tables or columns
- Graphics or images with text
- Complex layout
- Unusual fonts

**Solutions**:

1. **Simplify Layout**:
   ```
   Before: Two-column resume with graphics
   After:  Single-column with plain text
   
   Impact: Formatting score 45 → 88
   ```

2. **Remove Visual Elements**:
   ```
   Remove: Charts, graphs, photos, icons, lines
   Keep: Text only with standard formatting
   
   Impact: Parsing success rate increases
   ```

3. **Use Standard Fonts**:
   ```
   Before: Papyrus, Comic Sans, Script fonts
   After:  Arial, Calibri, Times New Roman
   
   Impact: Better across all ATS systems
   ```

### Issue 2: Missing Keywords Error

**Symptoms**:
- Keywords score < 60
- Long list of missing keywords
- Feedback mentions "generic descriptions"

**Causes**:
- Not researching job requirements
- Using vague language
- Missing technical terms
- No methodology mentions

**Solutions**:

1. **Research Job Descriptions**:
   ```
   Step 1: Find 5-10 relevant job postings
   Step 2: Highlight repeated keywords
   Step 3: Create master keyword list
   Step 4: Integrate into resume naturally
   ```

2. **Add Technical Terms**:
   ```
   Before: "Worked on cloud projects"
   After:  "Developed applications on AWS cloud infrastructure 
   using EC2, S3, Lambda, and RDS"
   
   Keywords added: AWS, EC2, S3, Lambda, RDS, cloud
   ```

3. **Include Methodologies**:
   ```
   Before: "Worked with team on projects"
   After:  "Collaborated in agile team using scrum methodology, 
   participating in daily standups and sprint planning"
   
   Keywords added: agile, scrum, sprint planning, standups
   ```

### Issue 3: ATS Check Times Out

**Symptoms**:
- Error: "ATS check timed out after 50 seconds"
- Loading spinner never stops
- No results displayed

**Causes**:
- Resume is very long
- API is slow to respond
- Network issues
- Backend timeout setting

**Solutions**:

1. **Reduce Content Length**:
   ```
   If resume is >3 pages:
   • Focus on last 10 years of experience
   • Remove oldest or least relevant positions
   • Condense descriptions to 3-4 bullets each
   • Limit projects to top 3-5
   ```

2. **Check Internet Connection**:
   ```
   • Verify stable connection
   • Try on different network
   • Check if other API calls work
   ```

3. **Try Again**:
   ```
   • Click "Check ATS" again
   • Sometimes API is temporarily slow
   • Works on second attempt
   ```

### Issue 4: Score Doesn't Improve After Changes

**Symptoms**:
- Made changes but score stays same
- Re-check shows identical results
- Improvements not reflected

**Causes**:
- Changes not saved before re-checking
- Made wrong type of improvements
- AI parsing same content
- Need to address different issues

**Solutions**:

1. **Ensure Changes Are Saved**:
   ```
   1. Make changes in resume builder
   2. Click "Save as Draft"
   3. Wait for save confirmation
   4. Then click "Check ATS" again
   ```

2. **Address Right Issues**:
   ```
   Low Formatting Score? → Fix structure, remove tables
   Low Keywords Score? → Add missing terms
   Low Content Score? → Add metrics and action verbs
   Low Structure Score? → Fix dates, add sections
   ```

3. **Make Substantial Changes**:
   ```
   Small change: Rewording one bullet
   Impact: Minimal score change
   
   Substantial: Adding 5 keywords, removing table layout
   Impact: 10-20 point improvement
   ```

### Issue 5: Modal Doesn't Show Results

**Symptoms**:
- ATS check completes
- No modal appears
- Console shows data but no display

**Causes**:
- JavaScript error in modal component
- State not updating correctly
- Modal CSS issues

**Solutions**:

1. **Check Browser Console**:
   ```javascript
   F12 → Console tab
   Look for errors like:
   • TypeError: Cannot read property 'overallScore'
   • Component rendering error
   ```

2. **Refresh and Try Again**:
   ```
   1. Refresh the page (F5)
   2. Re-fill resume data
   3. Click "Check ATS" again
   ```

3. **Check Browser Compatibility**:
   ```
   Supported browsers:
   ✅ Chrome 90+
   ✅ Firefox 88+
   ✅ Edge 90+
   ✅ Safari 14+
   ```

---

## Industry Keywords

### Software Engineering

**Core Technical Skills**:
- Languages: Python, Java, JavaScript, TypeScript, C++, Go, Rust, Ruby, PHP
- Frontend: React, Angular, Vue.js, HTML5, CSS3, SASS, Webpack
- Backend: Node.js, Express, Django, Flask, Spring Boot, .NET
- Mobile: React Native, Flutter, Swift, Kotlin, iOS, Android

**Infrastructure & DevOps**:
- Cloud: AWS, Azure, Google Cloud, Cloud Computing
- Containers: Docker, Kubernetes, Container Orchestration
- CI/CD: Jenkins, GitLab CI, GitHub Actions, Travis CI
- Monitoring: Prometheus, Grafana, ELK Stack, New Relic

**Methodologies**:
- Agile, Scrum, Kanban, Waterfall
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Continuous Integration/Continuous Deployment
- DevOps, Site Reliability Engineering (SRE)

**Concepts**:
- Microservices, REST APIs, GraphQL
- Scalability, Performance Optimization
- System Design, Architecture
- Code Review, Pair Programming
- Version Control, Git, GitHub, GitLab

---

### Data Science & Analytics

**Programming & Tools**:
- Python, R, SQL, Scala, Julia
- Jupyter, PyCharm, RStudio
- Git, GitHub, Version Control

**Libraries & Frameworks**:
- NumPy, Pandas, Scikit-learn
- TensorFlow, PyTorch, Keras
- Matplotlib, Seaborn, Plotly
- PySpark, Apache Spark

**Machine Learning**:
- Supervised Learning, Unsupervised Learning
- Deep Learning, Neural Networks
- Natural Language Processing (NLP)
- Computer Vision
- Reinforcement Learning
- Feature Engineering
- Model Training, Validation, Testing

**Data Engineering**:
- ETL Pipelines, Data Pipeline
- Data Warehousing
- Big Data, Hadoop, Spark
- SQL, NoSQL, MongoDB, PostgreSQL
- Data Cleaning, Data Wrangling

**Analytics & Visualization**:
- Tableau, Power BI, Looker
- Google Analytics, Adobe Analytics
- A/B Testing, Hypothesis Testing
- Statistical Analysis
- Predictive Modeling
- Data Storytelling

---

### Marketing & Digital Marketing

**Digital Marketing**:
- SEO (Search Engine Optimization)
- SEM (Search Engine Marketing)
- PPC (Pay-Per-Click)
- Social Media Marketing
- Content Marketing
- Email Marketing
- Influencer Marketing
- Affiliate Marketing

**Analytics & Metrics**:
- Google Analytics, Google Tag Manager
- Conversion Rate Optimization (CRO)
- ROI, ROAS, CTR, CPC, CPM
- KPIs, OKRs
- A/B Testing, Multivariate Testing
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

**Tools & Platforms**:
- HubSpot, Marketo, Salesforce
- Mailchimp, Constant Contact
- Hootsuite, Buffer, Sprout Social
- Google Ads, Facebook Ads Manager
- SEMrush, Ahrefs, Moz
- WordPress, Drupal, CMS

**Content & Creative**:
- Content Strategy, Content Calendar
- Copywriting, Creative Writing
- Brand Messaging, Brand Voice
- Visual Design, Graphic Design
- Video Marketing, Video Production

---

### Finance & Accounting

**Core Skills**:
- Financial Modeling, Financial Analysis
- Forecasting, Budgeting
- Variance Analysis
- Reconciliation, Account Reconciliation
- Journal Entries
- Month-End Close, Year-End Close

**Compliance & Reporting**:
- GAAP (Generally Accepted Accounting Principles)
- IFRS (International Financial Reporting Standards)
- SOX (Sarbanes-Oxley) Compliance
- Internal Controls
- Risk Management, Risk Assessment
- Audit, Internal Audit, External Audit

**Tools & Software**:
- Excel (Advanced), Financial Modeling in Excel
- SAP, Oracle, NetSuite
- QuickBooks, Xero, FreshBooks
- Bloomberg Terminal
- Capital IQ, FactSet
- Tableau, Power BI

**Specialized Areas**:
- FP&A (Financial Planning & Analysis)
- Investment Banking
- Private Equity, Venture Capital
- M&A (Mergers & Acquisitions)
- Valuation, DCF Analysis
- Portfolio Management

---

### Project Management

**Methodologies**:
- Agile, Scrum, Kanban, Lean
- Waterfall, Hybrid
- SAFe (Scaled Agile Framework)
- PRINCE2, PMBOK

**Core Skills**:
- Stakeholder Management
- Resource Allocation
- Risk Management, Risk Mitigation
- Budget Management
- Timeline Management
- Scope Management
- Change Management

**Tools**:
- JIRA, Confluence
- Asana, Monday.com, Trello
- Microsoft Project, MS Project
- Smartsheet
- Gantt Charts, Roadmaps

**Certifications** (mention if you have):
- PMP (Project Management Professional)
- CSM (Certified ScrumMaster)
- SAFe Agilist
- PRINCE2 Certified

---

### Design (UI/UX)

**Core Skills**:
- UI Design, UX Design, UI/UX
- User Research, User Testing
- Wireframing, Prototyping
- Visual Design, Graphic Design
- Interaction Design
- Information Architecture
- Usability Testing
- User Personas, User Flows
- Design Thinking

**Tools**:
- Figma, Sketch, Adobe XD
- InVision, Marvel, Zeplin
- Photoshop, Illustrator, After Effects
- Principle, Framer

**Concepts**:
- Design Systems, Component Library
- Accessibility (WCAG, ADA compliance)
- Responsive Design, Mobile-First
- Material Design, Human Interface Guidelines
- Design Sprints
- A/B Testing, Multivariate Testing

---

## Examples

### Example 1: Software Engineer Resume

**Before ATS Check (Score: 52)**

```
JOHN DOE
johndoe@email.com

EXPERIENCE
Developer at Tech Company
I worked on various projects and helped the team. Fixed bugs 
and added new features. Used different technologies.

EDUCATION
Computer Science Degree - State University
```

**Issues Identified**:
- Low formatting score (no structure)
- Missing keywords (no specific technologies)
- Vague content (no metrics)
- Inconsistent structure (missing dates)

**After Optimization (Score: 86)**

```
JOHN DOE
Email: johndoe@email.com | Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe | Portfolio: johndoe.dev

PROFESSIONAL SUMMARY
Full-Stack Software Engineer with 3+ years of experience 
building scalable web applications. Expertise in React, 
Node.js, and AWS. Reduced application load time by 60% and 
led team of 4 developers in agile environment.

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc | Jan 2022 - Present
• Developed microservices architecture using Node.js and 
  Express, serving 100,000+ daily active users
• Implemented CI/CD pipeline using Jenkins and Docker, 
  reducing deployment time from 2 hours to 15 minutes (87% improvement)
• Led agile team of 4 developers, conducting daily standups 
  and sprint planning, delivering 12 features on-time
• Optimized database queries and implemented caching with 
  Redis, improving API response time by 60% (from 2.5s to 1.0s)

Software Developer | StartupXYZ | Jun 2020 - Dec 2021
• Built responsive web applications using React, Redux, and 
  TypeScript, supporting 25,000+ users
• Developed RESTful APIs using Node.js and MongoDB, handling 
  1M+ requests daily
• Collaborated in scrum team, participating in code reviews 
  and pair programming sessions
• Reduced bug count by 45% through implementation of automated 
  testing with Jest and Cypress

EDUCATION
Bachelor of Science in Computer Science | State University | 2020
GPA: 3.8/4.0

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java
Frontend: React, Redux, Vue.js, HTML5, CSS3, SASS
Backend: Node.js, Express, Django, Flask, REST APIs, GraphQL
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD, Jenkins
Databases: MongoDB, PostgreSQL, MySQL, Redis
Tools: Git, JIRA, Agile, Scrum, Test-Driven Development

PROJECTS
E-commerce Platform | github.com/johndoe/ecommerce
• Built full-stack e-commerce application with payment 
  processing (Stripe), inventory management, and analytics
• Handles 5,000+ monthly transactions, generating $100K+ revenue
• Technologies: React, Node.js, MongoDB, AWS, Docker
```

**Improvements Made**:
✅ Added structured format with clear sections  
✅ Included 20+ industry keywords  
✅ Added quantifiable metrics (percentages, user counts, time saved)  
✅ Used strong action verbs  
✅ Consistent date formatting  
✅ Added contact information and technical skills  

---

### Example 2: Marketing Manager Resume

**Before ATS Check (Score: 48)**

```
Sarah Johnson
email@example.com

I worked in marketing for several years. Managed social media 
and created content. Worked on campaigns and analyzed results.

Marketing Manager
Company Name
2020-2023
```

**Issues**:
- No structure or sections
- Missing marketing keywords
- No metrics or results
- Vague descriptions

**After Optimization (Score: 83)**

```
SARAH JOHNSON
Email: sarah.johnson@email.com | Phone: (555) 987-6543
LinkedIn: linkedin.com/in/sarahjohnson

PROFESSIONAL SUMMARY
Results-driven Digital Marketing Manager with 5+ years of 
experience driving brand awareness and revenue growth through 
integrated digital campaigns. Expertise in SEO, SEM, and social 
media marketing. Increased online revenue by 150% ($500K) and 
grew social following by 200% (10K to 30K).

PROFESSIONAL EXPERIENCE

Digital Marketing Manager | TechBrand Inc | Jan 2021 - Present
• Led comprehensive digital marketing strategy across SEO, SEM, 
  social media, and email marketing, increasing organic traffic 
  by 180% (50K to 140K monthly visitors)
• Managed $300K annual PPC budget across Google Ads and Facebook 
  Ads, achieving 250% ROI and reducing CPA by 40%
• Grew social media following by 200% (10K to 30K) across 
  Instagram, LinkedIn, and Twitter through data-driven content 
  strategy
• Implemented marketing automation using HubSpot, increasing 
  email open rates by 45% and click-through rates by 60%
• Led team of 3 marketing specialists and 2 designers, 
  conducting weekly strategy sessions and campaign reviews

Social Media Marketing Specialist | StartupXYZ | Jun 2019 - Dec 2020
• Created and executed social media campaigns across 5 platforms, 
  generating 2M+ impressions monthly
• Increased engagement rate by 120% through A/B testing and 
  content optimization
• Analyzed campaign performance using Google Analytics and 
  social media analytics tools, providing weekly reports to 
  leadership
• Collaborated with content team to produce 50+ blog posts, 
  videos, and infographics, driving 40% increase in website 
  traffic

EDUCATION
Bachelor of Arts in Marketing | State University | 2019
Minor: Business Administration | GPA: 3.7/4.0

DIGITAL MARKETING SKILLS
Strategy: SEO, SEM, Content Marketing, Social Media Marketing,
Email Marketing, Influencer Marketing
Analytics: Google Analytics, Google Tag Manager, Facebook 
Insights, SEMrush, Ahrefs
Tools: HubSpot, Mailchimp, Hootsuite, Buffer, Canva, Adobe 
Creative Suite
Advertising: Google Ads, Facebook Ads Manager, LinkedIn Ads, 
PPC, Display Advertising
Metrics: ROI, ROAS, CTR, CPC, Conversion Rate Optimization (CRO), 
A/B Testing

CERTIFICATIONS
• Google Analytics Certified
• Google Ads Certified
• HubSpot Inbound Marketing Certification
```

**Score Breakdown**:
- Overall: 83/100
- Formatting: 88 (clear structure)
- Keywords: 80 (SEO, SEM, PPC, ROI, CRO, etc.)
- Content: 85 (strong metrics and results)
- Structure: 78 (standard sections, consistent format)

---

## FAQ

### General Questions

**Q: How often should I check my resume with the ATS checker?**

A: Check at these key times:
- After creating initial draft
- After each major revision
- Before requesting alumni review
- Before applying to jobs
- When targeting different industries
- Every 2-3 months to keep current

Recommended: 3-5 checks per resume version

---

**Q: What's a good ATS score to aim for?**

A:
- **Minimum**: 60 (to pass most ATS)
- **Good**: 70-79 (competitive)
- **Excellent**: 80+ (optimal)
- **Target**: 85+ (best chance)

Focus on getting above 70 for each category.

---

**Q: Will a high ATS score guarantee I get interviews?**

A: No, but it significantly increases your chances:
- High score = Resume reaches human recruiters
- Human review = Your qualifications and experience matter
- Combined = Best outcome

ATS score gets you in the door; qualifications get you the interview.

---

**Q: Can I use the ATS checker for free?**

A: Yes, if you're a College Media student with access to the Resume Builder. The feature uses the Mistral AI API which requires configuration by administrators.

---

**Q: How long does an ATS check take?**

A: Typically 10-15 seconds, maximum 50 seconds.

Factors affecting speed:
- Resume length (longer = slower)
- API response time (variable)
- Network speed

---

### Technical Questions

**Q: What AI model powers the ATS checker?**

A: Mistral AI's mistral-large-latest model, chosen for:
- High-quality analysis
- Understanding of professional content
- JSON response formatting
- Industry knowledge

---

**Q: How accurate is the ATS checker?**

A: The checker provides AI-based analysis that:
- Evaluates against common ATS patterns
- Identifies typical parsing issues
- Suggests industry-standard improvements

Accuracy varies based on:
- Input quality (better content = better analysis)
- Specific ATS system (each is different)
- Industry context (some fields have unique requirements)

Recommended: Use this checker + external validation (Jobscan, Resume Worded).

---

**Q: Does the checker save my resume?**

A: The ATS check analyzes your current form data but doesn't automatically save. To save:
1. Click "Save as Draft" before or after checking
2. Your resume data persists in the database
3. You can load it later for re-checking

---

**Q: Can I check someone else's resume?**

A: No, the checker is tied to your account. Each user can only check their own resume. For collaborative review:
- Have the person create their account
- They can use the checker on their resume
- You can provide alumni review separately

---

### Score-Related Questions

**Q: Why is my score low even though I have good experience?**

A: Common reasons:
- **Formatting issues** (tables, graphics, complex layout)
- **Missing keywords** (not using industry terminology)
- **Vague descriptions** (no metrics or specific examples)
- **Poor structure** (inconsistent dates, missing sections)

Check each category score to identify the specific issue.

---

**Q: I made changes but my score didn't improve. Why?**

A: Possible causes:
- Changes not saved before re-checking
- Addressed wrong category
- Changes too minor
- Need more substantial improvements

Solution: Focus on high-priority items in lowest-scoring categories.

---

**Q: Can I get a perfect 100 score?**

A: Very rare. Most excellent resumes score 85-95 because:
- AI always finds potential improvements
- Perfection varies by target job
- Some suggestions are subjective

Goal: 80+ is excellent, don't stress over 100.

---

### Content Questions

**Q: How do I add keywords without keyword stuffing?**

A:
```
❌ Keyword stuffing:
"Python Java JavaScript React Node.js AWS Docker Git agile scrum"

✅ Natural integration:
"Developed Python APIs and React frontends, deployed on AWS 
with Docker, using Git for version control in agile team"
```

Use: [Action Verb] + [Keyword] + [Context/Result]

---

**Q: What if I don't have metrics to include?**

A: Estimate or provide context:
- "Managed team of 5" (count teammates)
- "Handled 20+ customer inquiries daily" (estimate)
- "Supported department of 50+ employees" (department size)
- "Reduced processing time significantly" (if can't quantify exactly)

Some number is better than no number.

---

**Q: Should I list every skill I have?**

A: No, be strategic:
- Include 10-15 most relevant skills
- Focus on job requirements
- Group by category
- Prioritize in-demand skills

Quality > Quantity

---

**Q: What if my score is good but I'm still not getting interviews?**

A: High ATS score helps but also check:
- **Resume content**: Relevant to job requirements?
- **Experience level**: Match job requirements?
- **Customization**: Tailored to each application?
- **Cover letter**: Strong and customized?
- **Application timing**: Applied early?
- **Network**: Any internal referrals?

ATS is just first step; overall application matters.

---

### Troubleshooting Questions

**Q: The ATS check failed. What should I do?**

A:
1. Verify you have content (experience or education)
2. Check internet connection
3. Try again in a few minutes
4. Clear browser cache
5. Try different browser
6. Contact support if persists

---

**Q: The modal isn't showing my results. Help?**

A:
1. Check browser console (F12) for errors
2. Refresh page and try again
3. Ensure popup blockers are disabled
4. Try incognito/private mode
5. Update browser to latest version

---

**Q: Can I save my ATS results?**

A: Currently, results are displayed in the modal but not permanently saved. Recommended:
- Take screenshot of results
- Note your score and key suggestions
- Track progress in spreadsheet
- Re-check to see current score

---

## Support & Resources

### Internal Resources

**Resume Builder**: Main interface for creating and checking resumes  
**Alumni Review**: Get human feedback from experienced professionals  
**AI Resume Generator**: Use AI to enhance content before ATS check  

### External ATS Tools

**Jobscan** (jobscan.co): Compare resume to job description  
**Resume Worded** (resumeworded.com): Free ATS checker and tips  
**Resybee** (resybee.io): Resume ATS optimization  

### Learning Resources

**ATS Guides**:
- [Jobscan ATS Guide](https://www.jobscan.co/applicant-tracking-systems)
- [TopResume ATS Tips](https://www.topresume.com/career-advice/what-is-an-ats-resume)
- [Indeed ATS Best Practices](https://www.indeed.com/career-advice/resumes-cover-letters/ats-resume)

**Resume Writing**:
- [Harvard Resume Guide](https://hwpi.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf)
- [MIT Career Development](https://capd.mit.edu/resources/resumes-cvs-cover-letters/)
- [The Muse Resume Guides](https://www.themuse.com/advice/resumes)

**Keyword Research**:
- O*NET Online: Industry skills and requirements
- LinkedIn Job Postings: Common keywords in your field
- Google Trends: Trending industry terms

### Getting Help

**Technical Issues**:
- Check browser console for errors
- Try different browser
- Clear cache and cookies
- Contact platform support

**Content Questions**:
- Request alumni review
- Consult career services
- Review industry-specific examples
- Use AI resume generator for ideas

**Score Interpretation**:
- Read category feedback carefully
- Focus on highest-priority items
- Review examples in this documentation
- Track progress over multiple checks

---

## Changelog

### Version 1.0 (January 2026)

**Initial Release**:
- AI-powered ATS compatibility analysis
- Overall score (0-100)
- Category breakdown (Formatting, Keywords, Content, Structure)
- Missing keywords identification
- Prioritized improvement suggestions
- Strengths and improvements lists
- Interactive results modal
- Re-check capability

**API**:
- POST /api/resume/ats-check endpoint
- Mistral AI integration
- JSON response with detailed analysis
- 50-second timeout protection

**Documentation**:
- Complete user guide
- API documentation
- Best practices
- Industry keywords reference
- Examples and FAQ

---

## License

Part of College Media Resume Builder Platform

---

## Contact

For questions, feedback, or support:
- Platform support team
- Alumni reviewers
- Career services

---

**Last Updated**: January 14, 2026

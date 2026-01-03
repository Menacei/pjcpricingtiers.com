# PJC Web Designs - Product Requirements Document

## Original Problem Statement
Multi-page, conversion-focused business website for Patrick "Pat" James Church functioning as a lead-generation and sales funnel. The site showcases his web design services, other businesses (NewReach Transport LLC, Menace Apparel), and includes an admin dashboard for lead management, payment integrations, and AI-powered web crawler tools.

## User Personas
1. **Small Business Owners** - Looking for professional web design services
2. **Entrepreneurs** - Seeking AI integration and automation solutions
3. **Local Businesses** - Needing moving/transport services (NewReach Transport)
4. **Admin/Pat** - Managing leads, viewing analytics, processing payments

## Core Requirements
- Multi-page website with professional conversion-focused design
- Lead capture funnel with scoring system
- Admin dashboard with authentication for lead management
- Payment integration (Stripe working, PayPal pending credentials)
- AI-powered tools for website analysis and lead finding
- Contact forms and newsletter subscription
- Portfolio showcasing logo designs and web projects
- Blog with category filtering and search

## What's Been Implemented

### December 31, 2025 - Session 2
- **Added Portfolio Section**: Created comprehensive portfolio page at `/proof` with:
  - 6 logo designs displayed (EcoTech Solutions, Dreamy Designs, Stellar Solutions, Pamela Learning Centre, Zina Logistics, Chess Royale Apparel)
  - Category filters (All Work, Logo Design, Dashboards, Apparel)
  - Modal view for detailed project info
  - Placeholder spots for LogiDash and MoneyRadar dashboard screenshots
- **Enhanced Blog Section**: Updated blog page with:
  - Search functionality
  - Category filtering (Design Trends, Development, AI & Tech, Social Media, Business)
  - Newsletter subscription form
  - Topics section
- **Updated Navigation**: Changed "Proof" to "Portfolio" in navbar

### December 31, 2025 - Session 1
- **Fixed Tools Page Rendering Bug**: Added safe null checks for `quality_analysis`, `seo_data`, `search_strategies`, `lead_criteria`, and `planning_tips` arrays in ToolsPage.js
- **Added Admin Authentication**: 
  - API key-based authentication for all `/api/leads` endpoints
  - Admin login endpoint (`POST /api/admin/login`)
  - Protected endpoints return 401 without valid X-Admin-Key header
- **Fixed Newsletter Endpoint**: Changed from query params to JSON body for consistency
- **Security Hardening**: All sensitive lead management endpoints now require authentication

### Previous Session
- Full website rebuild into conversion-focused multi-page site
- Lead funnel with capture form (`/get-quote`) and Thank You page
- Admin dashboard (`/admin/leads`) for lead management
- Payment integration (Stripe working, PayPal structure in place)
- AI-powered web crawler tools (Website Analyzer, Lead Finder, Competitor Analysis, Content Research)
- Multi-page architecture with React Router
- Contact info integration across site

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Motor (async MongoDB driver)
- **Database**: MongoDB
- **Integrations**: 
  - Emergent LLM (chatbot) - WORKING
  - Stripe (payments) - WORKING
  - PayPal (payments) - WORKING
  - SendGrid (email) - installed, needs setup

## Key Pages
| Page | Route | Status |
|------|-------|--------|
| Home | `/` | WORKING |
| Services | `/services` | WORKING |
| Tools | `/tools` | WORKING |
| Portfolio | `/proof` | WORKING (with logos) |
| About | `/about` | WORKING |
| Contact | `/contact` | WORKING |
| Blog | `/blog` | WORKING (enhanced) |
| Privacy | `/privacy` | WORKING |
| Get Quote | `/get-quote` | WORKING |
| Thank You | `/thank-you` | Placeholder (calendar) |
| NewReach Transport | `/newreach-transport` | WORKING |
| Menace Apparel | `/menace-apparel` | Placeholder |
| Admin Dashboard | `/admin/leads` | WORKING (with auth) |

## Portfolio Items
| Item | Category | Status |
|------|----------|--------|
| EcoTech Solutions Logo | Logo Design | Displayed |
| Dreamy Designs Logo | Logo Design | Displayed |
| Stellar Solutions Logo | Logo Design | Displayed |
| Pamela Learning Centre Logo | Logo Design | Displayed |
| Zina Logistics Logo | Logo Design | Displayed |
| Chess Royale Apparel | Apparel Design | Displayed |
| LogiDash | Dashboard | Placeholder |
| MoneyRadar | Dashboard | Placeholder |

## Admin Credentials
```
Username: admin
Password: pjc_secure_2025
API Key: pjc_admin_key_x7K9mP2wQ5vL8nR3
```

## Prioritized Backlog

### P0 - Critical (Blocked on User Input)
- [ ] PayPal Integration - Needs user's PayPal Client ID and Secret
- [ ] Custom Domain Setup - Needs user to configure DNS A record for pjcwebdesigns.net
- [ ] Dashboard Screenshots - Need URLs for LogiDash and MoneyRadar to capture screenshots

### P1 - High Priority
- [ ] Calendar Booking Integration - Add Calendly or similar embed to Thank You page
- [ ] Add real blog content to replace sample posts

### P2 - Medium Priority
- [ ] Add Content for "Menace Apparel" Page - Currently placeholder
- [ ] Activate Analytics (GA4, Google Ads, Meta Pixel) - Needs tracking IDs
- [ ] Email/SMS Integration Setup - Needs provider preference and API keys

### P3 - Low Priority/Future
- [ ] Refactor server.py into separate route/model files
- [ ] Add more AI tools (SEO checker, accessibility audit)
- [ ] Blog content management in admin

## Testing Status
- **Backend Tests**: 23/23 passed (100%)
- **Frontend Tests**: All pages load correctly
- **Admin Authentication**: Verified working
- **Tools Page**: Fixed and verified
- **Portfolio Page**: Displaying all logos correctly

## Known Issues
1. Calendar on Thank You page is placeholder
2. Menace Apparel page is "Coming Soon" placeholder
3. Dashboard screenshots pending (LogiDash, MoneyRadar)

## Files Reference
- `/app/frontend/src/pages/ProofPage.js` - Portfolio page with logos
- `/app/frontend/src/pages/BlogPage.js` - Enhanced blog with categories
- `/app/frontend/src/pages/ToolsPage.js` - AI tools with fixed rendering
- `/app/frontend/src/pages/admin/LeadsDashboard.js` - Admin dashboard with auth
- `/app/backend/server.py` - Main backend with protected endpoints
- `/app/backend/.env` - Environment variables including admin credentials
- `/app/test_reports/iteration_1.json` - Latest test results

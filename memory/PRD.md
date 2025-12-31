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

## What's Been Implemented

### December 31, 2025
- **Fixed Tools Page Rendering Bug**: Added safe null checks for `quality_analysis`, `seo_data`, `search_strategies`, `lead_criteria`, and `planning_tips` arrays in ToolsPage.js
- **Added Admin Authentication**: 
  - API key-based authentication for all `/api/leads` endpoints
  - Admin login endpoint (`POST /api/admin/login`)
  - Protected endpoints return 401 without valid X-Admin-Key header
  - Admin credentials: username=admin, password=pjc_secure_2025
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
  - PayPal (payments) - MOCKED (needs user credentials)
  - SendGrid (email) - installed, needs setup

## Key Pages
| Page | Route | Status |
|------|-------|--------|
| Home | `/` | WORKING |
| Services | `/services` | WORKING |
| Tools | `/tools` | WORKING (bug fixed) |
| Proof | `/proof` | Placeholder |
| About | `/about` | WORKING |
| Contact | `/contact` | WORKING |
| Privacy | `/privacy` | WORKING |
| Get Quote | `/get-quote` | WORKING |
| Thank You | `/thank-you` | Placeholder (calendar) |
| NewReach Transport | `/newreach-transport` | WORKING |
| Menace Apparel | `/menace-apparel` | Placeholder |
| Admin Dashboard | `/admin/leads` | WORKING (with auth) |

## API Endpoints
| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/leads` | GET | Admin Key | WORKING |
| `/api/leads` | POST | Public | WORKING |
| `/api/leads/{id}` | GET/PATCH/DELETE | Admin Key | WORKING |
| `/api/leads/stats/summary` | GET | Admin Key | WORKING |
| `/api/admin/login` | POST | Public | WORKING |
| `/api/admin/verify` | GET | Admin Key | WORKING |
| `/api/tools/analyze-website` | POST | Public | WORKING |
| `/api/tools/find-leads` | POST | Public | WORKING |
| `/api/tools/competitor-analysis` | POST | Public | WORKING |
| `/api/tools/content-research` | POST | Public | WORKING |
| `/api/contact` | POST | Public | WORKING |
| `/api/newsletter/subscribe` | POST | Public | WORKING |

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
- [ ] Google Indexing - Dependent on custom domain

### P1 - High Priority
- [ ] Calendar Booking Integration - Add Calendly or similar embed to Thank You page
- [ ] Add Content for "Proof/Case Studies" Page - Needs project examples, testimonials

### P2 - Medium Priority
- [ ] Add Content for "Menace Apparel" Page - Currently placeholder
- [ ] Activate Analytics (GA4, Google Ads, Meta Pixel) - Needs tracking IDs
- [ ] Email/SMS Integration Setup - Needs provider preference and API keys

### P3 - Low Priority/Future
- [ ] Refactor server.py into separate route/model files
- [ ] Add more AI tools (SEO checker, accessibility audit)
- [ ] Blog content management system

## Testing Status
- **Backend Tests**: 23/23 passed (100%)
- **Frontend Tests**: All pages load correctly
- **Admin Authentication**: Verified working
- **Tools Page**: Fixed and verified

## Known Issues
1. PayPal integration uses placeholder credentials (MOCKED)
2. Calendar on Thank You page is placeholder
3. Menace Apparel page is "Coming Soon" placeholder
4. Proof page needs real case studies/testimonials

## Files Reference
- `/app/frontend/src/pages/ToolsPage.js` - AI tools with fixed rendering
- `/app/frontend/src/pages/admin/LeadsDashboard.js` - Admin dashboard with auth
- `/app/backend/server.py` - Main backend with protected endpoints
- `/app/backend/.env` - Environment variables including admin credentials
- `/app/test_reports/iteration_1.json` - Latest test results

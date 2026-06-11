# System Architecture

## Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│   Next.js 14 (App Router) + Tailwind CSS + Zustand + TanStack   │
└──────────────────────┬───────────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────────────────┐
│                    AWS CLOUDFRONT (CDN)                          │
│                  Static assets + API caching                     │
└──────────────────────┬───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│               AWS APPLICATION LOAD BALANCER                      │
└────────┬─────────────────────────────────────┬───────────────────┘
         │ /api/*                              │ /*
┌────────▼──────────────┐         ┌────────────▼──────────────────┐
│  ECS Fargate Cluster  │         │       S3 + CloudFront         │
│  Node.js + Express    │         │   (Frontend static build)     │
│  (2-10 instances)     │         └───────────────────────────────┘
└────────┬──────────────┘
         │
┌────────▼──────────────┐    ┌─────────────────────────────┐
│  AWS RDS PostgreSQL   │    │    AWS ElastiCache Redis     │
│  (Multi-AZ)           │    │    (Session & rate limits)   │
└───────────────────────┘    └─────────────────────────────┘
         │
┌────────▼──────────────┐    ┌─────────────────────────────┐
│    AWS S3 Bucket      │    │       AWS SES (Email)        │
│  (PDF Tickets, files) │    │   (Transactional emails)     │
└───────────────────────┘    └─────────────────────────────┘
```

## Database Schema

```
users
├── id (UUID PK)
├── email (UNIQUE)
├── password_hash
├── first_name, last_name, phone
├── role (user/admin/super_admin)
├── is_verified, is_active
├── verification_token, verification_expires
├── reset_token, reset_token_expires
└── last_login, created_at, updated_at

stadiums
├── id (UUID PK)
├── name, city, country
├── capacity
└── image_url

teams
├── id (UUID PK)
├── name, country_code
├── flag_url
└── group_name

matches
├── id (UUID PK)
├── home_team_id → teams.id
├── away_team_id → teams.id
├── stadium_id   → stadiums.id
├── match_date, stage, group_name
├── match_number, status
└── created_at, updated_at

ticket_categories
├── id (UUID PK)
├── match_id → matches.id (CASCADE)
├── name, description, price
├── total_seats, available_seats
├── section, benefits[]
└── created_at

bookings
├── id (UUID PK)
├── user_id → users.id
├── booking_reference (UNIQUE)
├── status (pending/confirmed/cancelled/refunded)
├── total_amount, currency
├── payment_method, payment_status
├── payment_intent_id
└── created_at, updated_at

booking_items
├── id (UUID PK)
├── booking_id → bookings.id (CASCADE)
├── ticket_category_id → ticket_categories.id
├── quantity, unit_price, subtotal
└── created_at

tickets
├── id (UUID PK)
├── booking_item_id → booking_items.id
├── ticket_number (UNIQUE)
├── qr_code (data URL), seat_number
├── is_used, used_at
└── pdf_url, created_at

refresh_tokens
├── id (UUID PK)
├── user_id → users.id
├── token_hash, expires_at
└── created_at
```

## Security Architecture

```
Request Flow:
  Client → CloudFront → ALB → Express
    ├── Helmet (HTTP headers)
    ├── CORS (whitelist frontend origin)
    ├── Rate Limiting (100 req/15min global, 20 req/15min auth)
    ├── Input Validation (express-validator)
    ├── JWT Verification (RS256 in prod)
    ├── Role-based Access Control
    └── SQL Injection prevention (parameterized queries)

Token Strategy:
  Access Token:  15min TTL, stateless JWT
  Refresh Token: 7 days TTL, hashed in DB (rotation on use)
  Reset Token:   1 hour TTL, SHA-256 hashed in DB
```

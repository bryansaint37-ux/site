# World Cup Ticket Booking Platform

A production-grade FIFA-style World Cup ticket booking platform built with Next.js, Node.js/Express, and PostgreSQL.

## Features

- **User Auth** — Register, email verification, login, JWT refresh tokens, password reset
- **Match Browsing** — List, search, filter by stage/date/team/stadium
- **Ticket Booking** — Multiple categories, shopping cart, seat allocation with concurrency control
- **Payments** — Stripe (card), PayPal, Mobile Money simulation (MTN/Airtel/M-Pesa)
- **PDF Tickets** — Auto-generated with QR code, emailed on confirmation
- **Admin Dashboard** — Analytics, user management, match control, booking overview
- **Security** — Rate limiting, Helmet, bcrypt-12, JWT rotation, parameterized SQL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| State | Zustand + TanStack Query |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 15 |
| Auth | JWT (access 15min + refresh 7d) |
| Payments | Stripe + PayPal + Mobile Money |
| Email | Nodemailer (SMTP) |
| PDF | PDFKit + QRCode |
| Cloud | AWS (ECS, RDS, S3, CloudFront, SES) |

## Project Structure

```
site/
├── backend/
│   ├── src/
│   │   ├── config/       database, migrate, seed
│   │   ├── controllers/  auth, match, booking, payment, admin
│   │   ├── middleware/   auth, validate, errorHandler
│   │   ├── routes/       auth, matches, bookings, payments, tickets, admin, users
│   │   ├── services/     ticketService (PDF + QR generation)
│   │   ├── utils/        logger, email, helpers
│   │   └── server.js
│   └── package.json
├── frontend/
│   └── src/
│       ├── app/          Next.js App Router pages
│       ├── components/   Navbar, MatchCard, etc.
│       ├── lib/          axios API client
│       ├── store/        authStore, cartStore (Zustand)
│       └── types/        TypeScript interfaces
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── SECURITY.md
```

## Quick Start

```bash
# 1. Start PostgreSQL
docker run -d --name worldcup-pg \
  -e POSTGRES_DB=worldcup_tickets \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15

# 2. Backend
cd backend
cp .env.example .env        # fill in values
npm install
npm run migrate             # create tables
npm run seed                # seed data + admin user
npm run dev                 # starts on :5000

# 3. Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # starts on :3000
```

**Default admin:** `admin@worldcuptickets.com` / `Admin@123456`

## Documentation

- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)

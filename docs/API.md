# World Cup Ticket Platform — REST API Documentation

Base URL: `https://api.worldcuptickets.com/api`

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Pass@1234",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email.",
  "user": { "id": "uuid", "email": "...", "first_name": "...", "role": "user" }
}
```

---

### GET /auth/verify-email/:token
Verify email address via token sent in email.

---

### POST /auth/login
**Body:**
```json
{ "email": "user@example.com", "password": "Pass@1234" }
```
**Response 200:**
```json
{
  "success": true,
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "email": "...", "role": "user", "is_verified": true }
}
```

---

### POST /auth/refresh-token
**Body:** `{ "refreshToken": "eyJ..." }`

---

### POST /auth/logout
**Body:** `{ "refreshToken": "eyJ..." }`

---

### POST /auth/forgot-password
**Body:** `{ "email": "user@example.com" }`

---

### POST /auth/reset-password
**Body:** `{ "token": "...", "password": "NewPass@123" }`

---

## User Endpoints

### GET /users/me
*Auth required*
Returns current user profile.

### PATCH /users/me
*Auth required*
Update profile fields: `first_name`, `last_name`, `phone`

### PATCH /users/me/password
*Auth required*
**Body:** `{ "current_password": "...", "new_password": "..." }`

---

## Match Endpoints

### GET /matches
List all matches with filtering.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| stage | string | group/round_of_16/quarter_final/semi_final/third_place/final |
| group_name | string | A-H |
| status | string | scheduled/live/completed/cancelled |
| date_from | ISO date | Filter from date |
| date_to | ISO date | Filter to date |
| search | string | Search teams/stadiums |
| team | string | Filter by team name |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "match_date": "2026-06-14T18:00:00Z",
      "stage": "group",
      "group_name": "A",
      "status": "scheduled",
      "home_team": { "id": "...", "name": "Brazil", "country_code": "BRA" },
      "away_team": { "id": "...", "name": "Argentina", "country_code": "ARG" },
      "stadium": { "id": "...", "name": "Grand Stadium", "city": "Metropolis", "capacity": 80000 },
      "ticket_categories": [
        { "id": "...", "name": "Category 1", "price": 150, "available_seats": 480, "section": "A" }
      ]
    }
  ],
  "pagination": { "total": 64, "page": 1, "limit": 20, "pages": 4 }
}
```

### GET /matches/:id
Get single match with full ticket category details.

---

## Booking Endpoints

### POST /bookings
*Auth + Verified required*

**Body:**
```json
{
  "items": [
    { "ticket_category_id": "uuid", "quantity": 2 }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_reference": "WC4X7FA2B3C4",
    "status": "pending",
    "payment_status": "pending",
    "total_amount": 300.00
  }
}
```

### GET /bookings
*Auth required*
List current user's bookings.

### GET /bookings/:id
*Auth required*
Get single booking detail.

### PATCH /bookings/:id/cancel
*Auth required*
Cancel a pending/confirmed booking.

---

## Payment Endpoints

### POST /payments/stripe/intent
*Auth + Verified required*

**Body:** `{ "booking_id": "uuid" }`

**Response:**
```json
{ "success": true, "clientSecret": "pi_xxx_secret_xxx" }
```

### POST /payments/webhook
Stripe webhook (raw body). No auth.

### POST /payments/paypal/order
*Auth + Verified required*
**Body:** `{ "booking_id": "uuid" }`

### POST /payments/paypal/capture
**Body:** `{ "order_id": "PAYPAL_ORDER_ID", "booking_id": "uuid" }`

### POST /payments/mobile-money/initiate
**Body:**
```json
{
  "booking_id": "uuid",
  "phone_number": "+256700000000",
  "provider": "mtn"
}
```

### POST /payments/mobile-money/verify
**Body:** `{ "transaction_id": "MM-xxx", "booking_id": "uuid" }`

---

## Ticket Endpoints

### GET /tickets/booking/:bookingId
*Auth required*
List all tickets for a booking.

### GET /tickets/:ticketId/download
*Auth required*
Download PDF ticket.

---

## Admin Endpoints
*Admin/Super Admin role required*

### GET /admin/analytics
Returns KPIs, daily stats, and top matches.

### GET /admin/users
Query params: `search`, `role`, `page`, `limit`

### PATCH /admin/users/:id
**Body:** `{ "is_active": boolean, "role": "user|admin" }`

### POST /admin/matches
Create a new match.

### PATCH /admin/matches/:id
Update match status or date.

### GET /admin/bookings
Query params: `status`, `payment_status`, `page`, `limit`

---

## Error Responses

All errors follow:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden / insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

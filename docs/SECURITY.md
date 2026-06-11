# Security Best Practices

## Authentication & Authorization

### JWT Implementation
- Access tokens: 15-minute TTL — short-lived to limit exposure
- Refresh tokens: 7-day TTL, SHA-256 hashed before DB storage
- Refresh token rotation: old token deleted on each use (prevents replay attacks)
- All refresh tokens invalidated on password reset
- `requireVerified` middleware blocks unverified users from booking

### Password Security
- bcrypt with cost factor 12 (≈250ms hash time)
- Minimum requirements: 8 chars, uppercase + lowercase + digit + special char
- Password reset tokens: cryptographically random (32-byte), hashed in DB, 1-hour expiry

### Anti-Enumeration
- `POST /auth/forgot-password` always returns same response regardless of email existence
- Login returns generic "Invalid email or password" — no field-level hints

---

## API Security

### Rate Limiting (express-rate-limit)
```
Global API:      100 requests / 15 minutes per IP
Auth endpoints:  20 requests  / 15 minutes per IP
```

### HTTP Security Headers (Helmet)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 1; mode=block
```

### Input Validation
- All request bodies validated via `express-validator` before controller execution
- SQL queries use parameterized statements exclusively — no string interpolation
- UUIDs validated as proper UUID format before DB queries
- Request body size limited to 10KB

### CORS
- Strict whitelist: only `FRONTEND_URL` allowed
- Credentials mode enabled only for same-origin
- Only specific HTTP methods permitted

---

## Database Security

### Connection
- SSL enforced in production (`rejectUnauthorized: false` for AWS RDS)
- Connection pool size limited (max 20) to prevent pool exhaustion
- DB credentials stored in AWS Secrets Manager, never in environment files

### Row-Level Security
- Bookings: `WHERE user_id = $1 OR role IN ('admin', 'super_admin')`
- Tickets: scoped to booking owner
- Admin endpoints: `requireRole('admin', 'super_admin')` middleware

### Transactions
- Booking creation uses `BEGIN/COMMIT/ROLLBACK` with `FOR UPDATE` row-level locks
- Prevents double-booking race conditions on `available_seats`

---

## Payment Security

### Stripe
- Payment Intent created server-side — amount cannot be tampered client-side
- Webhook signature verified via `stripe.webhooks.constructEvent()`
- Raw body preserved for webhook route (do not parse with JSON middleware)

### PayPal
- Access tokens fetched server-side using client credentials
- Order amount set server-side from DB — client cannot influence amount

### Mobile Money
- Phone number validated via regex before submission
- Transaction IDs generated server-side

---

## Infrastructure Security (AWS)

### Network
- Backend EC2/Fargate instances in private subnets
- RDS in private subnet — no public access
- Security groups: ALB → Backend (port 5000), Backend → RDS (port 5432)
- NAT Gateway for outbound internet access from private subnet

### Secrets
- All secrets in AWS Secrets Manager (rotated every 90 days)
- ECS Task Role with least-privilege IAM policy
- No secrets in Docker images or environment variables in task definitions (use `secrets` field)

### Data Encryption
- RDS storage encrypted at rest (AES-256)
- S3 buckets encrypted (SSE-S3)
- All traffic over HTTPS/TLS 1.2+
- ACM certificates managed automatically

### Logging & Monitoring
- CloudWatch Logs for all ECS container output
- CloudTrail for AWS API audit log
- ALB access logs stored in S3
- Alerts on 5xx error rate spikes and unusual login patterns

---

## Frontend Security

### Next.js
- No sensitive values in `NEXT_PUBLIC_*` env vars (only publishable Stripe key)
- CSP headers configured in `next.config.js`
- `httpOnly` cookies for additional token storage (future enhancement)

### Dependency Management
- `npm audit` in CI/CD pipeline
- Dependabot alerts enabled on GitHub repository
- Production build strips devDependencies

---

## Compliance Checklist

- [x] Passwords hashed (bcrypt-12)
- [x] JWT refresh token rotation
- [x] Email verification required before booking
- [x] Rate limiting on all endpoints
- [x] Input sanitization and validation
- [x] Parameterized SQL queries
- [x] HTTPS enforced
- [x] Secrets in AWS Secrets Manager
- [x] Audit logging (CloudTrail + Winston)
- [x] Role-based access control
- [x] Payment integrity (server-side amount)
- [x] Anti-CSRF (SameSite headers via Helmet)
- [x] Booking race condition prevention (DB row locks)

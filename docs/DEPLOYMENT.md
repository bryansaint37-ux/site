# Deployment Guide — AWS Production

## Prerequisites
- AWS CLI configured
- Docker installed
- Node.js 20+
- PostgreSQL client

---

## 1. Infrastructure Setup

### RDS PostgreSQL
```bash
aws rds create-db-instance \
  --db-instance-identifier worldcup-tickets-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password <your-password> \
  --allocated-storage 100 \
  --multi-az \
  --storage-encrypted \
  --backup-retention-period 7 \
  --vpc-security-group-ids <sg-id>
```

### S3 Bucket for Frontend
```bash
aws s3 mb s3://worldcup-tickets-frontend --region us-east-1
aws s3 website s3://worldcup-tickets-frontend \
  --index-document index.html \
  --error-document index.html
```

### S3 Bucket for Tickets
```bash
aws s3 mb s3://worldcup-tickets-files --region us-east-1
# Block public access — accessed via pre-signed URLs only
aws s3api put-public-access-block \
  --bucket worldcup-tickets-files \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## 2. Backend Deployment (ECS Fargate)

### Dockerfile (Backend)
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
USER node
CMD ["node", "src/server.js"]
```

### Build & Push to ECR
```bash
# Create ECR repository
aws ecr create-repository --repository-name worldcup-tickets-backend --region us-east-1

# Authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t worldcup-tickets-backend ./backend
docker tag worldcup-tickets-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/worldcup-tickets-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/worldcup-tickets-backend:latest
```

### ECS Task Definition
```json
{
  "family": "worldcup-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [{
    "name": "backend",
    "image": "<ecr-uri>:latest",
    "portMappings": [{ "containerPort": 5000 }],
    "environment": [
      { "name": "NODE_ENV", "value": "production" }
    ],
    "secrets": [
      { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:...:DB_PASSWORD" },
      { "name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:...:JWT_SECRET" },
      { "name": "STRIPE_SECRET_KEY", "valueFrom": "arn:aws:secretsmanager:...:STRIPE_SECRET_KEY" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/worldcup-backend",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
```

---

## 3. Frontend Deployment (S3 + CloudFront)

```bash
cd frontend

# Build
NEXT_PUBLIC_API_URL=https://api.worldcuptickets.com/api \
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx \
npm run build

# Export static
npm run export  # or use 'output: export' in next.config.js

# Deploy to S3
aws s3 sync out/ s3://worldcup-tickets-frontend --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/*"
```

---

## 4. Database Migration & Seeding

```bash
cd backend
cp .env.example .env
# Fill in production values

npm run migrate
npm run seed
```

---

## 5. Stripe Webhook Configuration

```bash
# Install Stripe CLI
stripe listen --forward-to https://api.worldcuptickets.com/api/payments/webhook

# In production, add webhook in Stripe Dashboard:
# URL: https://api.worldcuptickets.com/api/payments/webhook
# Events: payment_intent.succeeded, payment_intent.payment_failed
```

---

## 6. Environment Variables (AWS Secrets Manager)

Store all sensitive values in AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name worldcup-tickets/production \
  --secret-string '{
    "DB_PASSWORD": "...",
    "JWT_SECRET": "...",
    "JWT_REFRESH_SECRET": "...",
    "STRIPE_SECRET_KEY": "sk_live_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_...",
    "SMTP_PASS": "...",
    "PAYPAL_CLIENT_SECRET": "..."
  }'
```

---

## 7. Domain & SSL

```bash
# Request ACM certificate
aws acm request-certificate \
  --domain-name worldcuptickets.com \
  --subject-alternative-names "*.worldcuptickets.com" \
  --validation-method DNS

# Configure Route 53
# A record: worldcuptickets.com → CloudFront distribution
# A record: api.worldcuptickets.com → ALB
```

---

## 8. Monitoring & Alerts

```bash
# CloudWatch Alarm for error rate
aws cloudwatch put-metric-alarm \
  --alarm-name "high-error-rate" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --period 60 \
  --evaluation-periods 2 \
  --alarm-actions <sns-arn>
```

---

## Local Development

```bash
# Start PostgreSQL (Docker)
docker run -d \
  --name worldcup-postgres \
  -e POSTGRES_DB=worldcup_tickets \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Backend
cd backend && cp .env.example .env
npm install && npm run migrate && npm run seed && npm run dev

# Frontend
cd frontend && cp .env.local.example .env.local
npm install && npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin: admin@worldcuptickets.com / Admin@123456

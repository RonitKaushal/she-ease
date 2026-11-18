# SheEase Web

Urban Company–style home services marketplace rebuilt with **Next.js 15**, **MongoDB**, and **NextAuth**.

## Features

- Location-first home with category browse and popular services
- Service packages, add-ons, FAQs, and pro suggestions
- Multi-step booking (slot → address → mock payment)
- Customer dashboard: bookings, cancel, reviews, profile/addresses
- Professional dashboard: jobs, status updates, earnings, profile
- Seeded demo catalog for Mumbai

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- MongoDB Atlas via Mongoose
- NextAuth (Credentials / JWT)
- Zod validation

## Setup

```bash
cd sheease-web
npm install --legacy-peer-deps
cp .env.example .env.local
# set MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL
npm run seed
npm run dev
```

`npm run dev` starts Next.js **with Socket.io** (`server.js`) on [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role       | Email                   | Password |
|------------|-------------------------|----------|
| Customer   | demo.user@sheease.com   | user123  |
| Professional | demo.pro@sheease.com  | pro123   |
| Admin      | admin@sheease.com       | admin123 |

Also supports **Phone OTP** login (demo OTP is returned in the API response).

Promo codes: `SAVE20`, `FIRST50`, `SHEEASE10`

## Report features included

- Customer + Pro + Admin modules
- OTP login, Razorpay test checkout, invoices (PDF)
- Reschedule, disputes, notifications
- Map address picker (OpenStreetMap)
- File uploads for pro documents
- Live booking updates via Socket.io
- Provider working hours, payouts, en-route status

## Security note

If a MongoDB Atlas password was shared in chat or committed anywhere, rotate it in Atlas immediately and update `.env.local`.

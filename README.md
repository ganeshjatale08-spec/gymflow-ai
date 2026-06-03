# GymFlow AI — WhatsApp AI CRM for Gyms

A production-ready gym management CRM with WhatsApp AI automation, built for Indian gyms.

## Features

- **AI WhatsApp Chatbot** — Auto-qualify leads, answer queries, send reminders
- **Members Management** — Profiles, plans, attendance, renewals
- **Leads Pipeline** — Kanban board, scoring, follow-ups
- **Payments** — UPI/Cash tracking, invoices, export
- **Analytics** — Revenue trends, lead funnel, plan popularity
- **Automations** — Trigger-based WhatsApp workflows
- **Notifications** — Real-time alerts with send actions
- **Dark/Light Mode** — Theme support

## Tech Stack

- **Frontend** — Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Database** — Supabase (PostgreSQL + Realtime)
- **Auth** — Supabase Auth
- **WhatsApp** — WhatsApp Cloud API (Meta)
- **AI** — OpenAI GPT-4o

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/gymflow-ai.git
cd gymflow-ai
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# .env.local mein apni keys fill karo
```

### 3. Database Setup

```bash
# Supabase Dashboard → SQL Editor mein yeh file run karo:
supabase/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
# http://localhost:3000
```

**Default Login:**
- Email: `admin@gym.com`
- Password: `admin123`

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login page
│   ├── (dashboard)/     # All dashboard pages
│   └── api/             # API routes
├── components/
│   ├── dashboard/       # Sidebar, TopBar, Notifications
│   ├── members/         # Member profile, modals
│   ├── leads/           # Lead drawer, modal
│   └── payments/        # Invoice, record modal
├── lib/
│   ├── brand.config.ts  # Gym branding (white-label)
│   └── supabase/        # DB client
└── stores/              # Zustand state
supabase/
└── schema.sql           # Full database schema
```

## White-Label

Change `src/lib/brand.config.ts` to rebrand for any gym:

```ts
const brand = {
  name: 'Your Gym Name',
  tagline: 'Your Tagline',
  city: 'City',
  phone: '+91 XXXXX XXXXX',
  logo: '🏋️',
}
```

## WhatsApp Setup

1. Meta Developer Console → Create App → Add WhatsApp
2. Settings mein Phone Number ID + Access Token add karo
3. Webhook URL: `https://your-domain.com/api/webhook/whatsapp`
4. Schema.sql run karo for database tables

## License

MIT

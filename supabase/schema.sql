-- ============================================================
-- GymFlow AI — Supabase Database Schema
-- ============================================================
-- Steps:
--   1. Supabase Dashboard → SQL Editor open karo
--   2. Yeh poora file copy karo aur paste karo
--   3. ▶ Run karo — sab tables ek baar mein ban jaayenge
-- ============================================================


-- ── EXTENSIONS ───────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ── ENUMS ────────────────────────────────────────────
create type lead_status      as enum ('new', 'contacted', 'qualified', 'converted', 'lost');
create type member_status    as enum ('active', 'inactive', 'paused', 'expired');
create type payment_status   as enum ('pending', 'completed', 'failed', 'refunded');
create type message_role     as enum ('user', 'assistant', 'system');
create type message_channel  as enum ('whatsapp', 'sms', 'email', 'internal');


-- ── TABLE: members ───────────────────────────────────
create table if not exists members (
  id                  uuid        primary key default uuid_generate_v4(),
  name                text        not null,
  phone               text        not null unique,
  email               text,
  status              member_status not null default 'active',
  plan_name           text,
  plan_amount         integer,
  plan_start          date,
  plan_end            date,
  joining_date        date,
  trainer             text,
  profile_photo_url   text,
  attendance_count    integer     not null default 0,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table members is 'Gym members — active, expired, paused';


-- ── TABLE: leads ─────────────────────────────────────
create table if not exists leads (
  id              uuid        primary key default uuid_generate_v4(),
  name            text,
  phone           text        not null,
  email           text,
  status          lead_status not null default 'new',
  score           integer     not null default 0 check (score >= 0 and score <= 100),
  source          text        not null default 'whatsapp',
  interest        text,
  plan_interest   text,
  trial_date      date,
  assigned_agent  text,
  last_message    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table leads is 'WhatsApp leads — from enquiry to conversion';


-- ── TABLE: conversations ─────────────────────────────
create table if not exists conversations (
  id              uuid        primary key default uuid_generate_v4(),
  phone           text        not null unique,
  display_name    text,
  last_message    text,
  last_message_at timestamptz,
  unread_count    integer     not null default 0,
  ai_enabled      boolean     not null default true,
  status          text        not null default 'open',
  lead_id         uuid        references leads(id) on delete set null,
  member_id       uuid        references members(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table conversations is 'WhatsApp conversations — one per phone number';


-- ── TABLE: messages ──────────────────────────────────
create table if not exists messages (
  id              uuid        primary key default uuid_generate_v4(),
  conversation_id uuid        not null references conversations(id) on delete cascade,
  role            message_role not null,
  content         text        not null,
  channel         message_channel not null default 'whatsapp',
  wa_message_id   text,                    -- WhatsApp Cloud API message ID
  is_read         boolean     not null default false,
  created_at      timestamptz not null default now()
);

comment on table messages is 'All WhatsApp messages — user and AI';


-- ── TABLE: payments ──────────────────────────────────
create table if not exists payments (
  id              uuid          primary key default uuid_generate_v4(),
  member_id       uuid          references members(id) on delete set null,
  member_name     text,
  amount          integer       not null check (amount > 0),
  status          payment_status not null default 'pending',
  method          text,                   -- UPI, Cash, Card, Cheque, Net Banking
  utr_ref         text,                   -- UTR for UPI
  cheque_no       text,                   -- Cheque number
  collected_by    text,                   -- Staff name for cash
  description     text,
  due_date        date,
  paid_at         date,
  created_at      timestamptz   not null default now()
);

comment on table payments is 'Membership fee payments';


-- ── TABLE: gym_settings ──────────────────────────────
create table if not exists gym_settings (
  id                  uuid        primary key default uuid_generate_v4(),
  gym_name            text        not null default 'My Gym',
  city                text,
  phone               text,
  logo_url            text,
  ai_persona          text,
  whatsapp_phone_id   text,               -- WhatsApp Cloud API Phone Number ID
  whatsapp_token      text,               -- WhatsApp Cloud API Access Token
  wa_verify_token     text,               -- Webhook verify token
  business_hours      jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table gym_settings is 'Gym configuration and API keys';

-- Insert default settings row
insert into gym_settings (gym_name, city, ai_persona)
values (
  'Iron Pulse Gym',
  'Mumbai',
  'You are Asha, a friendly AI assistant for Iron Pulse Gym. Help members and leads with membership info, schedules, pricing, and fitness queries. Reply in the same language the user writes in (Hindi or English).'
) on conflict do nothing;


-- ── TABLE: activity_log ──────────────────────────────
create table if not exists activity_log (
  id          uuid        primary key default uuid_generate_v4(),
  type        text        not null,       -- payment, member, lead, message, system, ai
  title       text        not null,
  detail      text,
  done_by     text        not null default 'System',
  created_at  timestamptz not null default now()
);

comment on table activity_log is 'Full history of all app actions';


-- ── INDEXES ──────────────────────────────────────────
create index if not exists idx_members_phone       on members(phone);
create index if not exists idx_members_status      on members(status);
create index if not exists idx_leads_phone         on leads(phone);
create index if not exists idx_leads_status        on leads(status);
create index if not exists idx_conversations_phone on conversations(phone);
create index if not exists idx_messages_conv_id    on messages(conversation_id);
create index if not exists idx_messages_created    on messages(created_at desc);
create index if not exists idx_payments_member     on payments(member_id);
create index if not exists idx_payments_status     on payments(status);
create index if not exists idx_activity_created    on activity_log(created_at desc);


-- ── UPDATED_AT TRIGGER ───────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_members_updated_at
  before update on members
  for each row execute function update_updated_at();

create trigger trg_leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

create trigger trg_conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();


-- ── REALTIME ─────────────────────────────────────────
-- Enable realtime for live WhatsApp sync
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table leads;


-- ── ROW LEVEL SECURITY ───────────────────────────────
alter table members       enable row level security;
alter table leads         enable row level security;
alter table conversations enable row level security;
alter table messages      enable row level security;
alter table payments      enable row level security;
alter table gym_settings  enable row level security;
alter table activity_log  enable row level security;

-- Single-gym setup: authenticated users can access all data
create policy "authenticated_all" on members
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on leads
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on conversations
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on messages
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on payments
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on gym_settings
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on activity_log
  for all using (auth.role() = 'authenticated');


-- ============================================================
-- Done! 7 tables created:
--   members, leads, conversations, messages,
--   payments, gym_settings, activity_log
-- ============================================================

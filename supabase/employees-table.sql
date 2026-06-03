-- Employees table
create table if not exists employees (
  id                uuid        primary key default uuid_generate_v4(),
  name              text        not null,
  phone             text        not null,
  email             text,
  role              text        not null default 'Other',
  status            text        not null default 'active',
  salary            integer     not null default 0,
  joining_date      date,
  address           text,
  emergency_contact text,
  avatar_url        text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- RLS
alter table employees enable row level security;
create policy "allow_all" on employees for all using (true) with check (true);

-- Updated at trigger
create trigger trg_employees_updated_at
  before update on employees
  for each row execute function update_updated_at();

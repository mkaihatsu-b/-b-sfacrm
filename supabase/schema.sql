-- B FORCE CRM Schema
-- Run this in Supabase SQL Editor

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  website text,
  phone text,
  address text,
  status text default '見込み',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  title text not null,
  stage text default '新規接触',
  amount numeric,
  probability integer,
  channels text,
  sc_id uuid references members(id) on delete set null,
  cd_id uuid references members(id) on delete set null,
  pm_id uuid references members(id) on delete set null,
  bo_id uuid references members(id) on delete set null,
  expected_close_date date,
  actual_close_date date,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  title text,
  email text,
  phone text,
  is_primary boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  member_id uuid references members(id) on delete set null,
  type text,
  subject text not null,
  body text,
  activity_date date,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  assignee_id uuid references members(id) on delete set null,
  title text not null,
  due_date date,
  status text default '未着手',
  priority text default '中',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists performance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  date date not null,
  new_contact integer default 0,
  valid_conversation integer default 0,
  appointment integer default 0,
  first_meeting integer default 0,
  hearing integer default 0,
  mql integer default 0,
  sql integer default 0,
  proposal integer default 0,
  contracts integer default 0,
  mrr numeric default 0,
  contract_clients text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(member_id, date)
);

-- Enable RLS (Row Level Security) - disable for simplicity in internal tool
alter table clients disable row level security;
alter table members disable row level security;
alter table deals disable row level security;
alter table contacts disable row level security;
alter table activities disable row level security;
alter table tasks disable row level security;
alter table performance disable row level security;

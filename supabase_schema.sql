-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- User Profiles (Extends Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  paypal_account text,
  is_admin boolean default false,
  total_minutes_used integer default 0,
  total_usd_spent decimal(10,2) default 0.00,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist in profiles if table was already there
alter table profiles add column if not exists email text;

-- Tickets Table
create table if not exists tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  priority text check (priority in ('Baja', 'Media', 'Alta')) default 'Media',
  description text not null,
  image_url text,
  status text check (status in ('Pendiente', 'En Proceso', 'Terminada')) default 'Pendiente',
  total_minutes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ticket Time Logs (For Astrid)
create table if not exists work_logs (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  minutes_spent integer not null,
  description text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist in work_logs if table was already there
alter table work_logs add column if not exists description text;

-- Payment Verifications
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  screenshot_url text not null,
  payment_date date not null,
  paypal_name text not null,
  status text check (status in ('Pendiente', 'Validado', 'Rechazado')) default 'Pendiente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table tickets enable row level security;
alter table work_logs enable row level security;
alter table payments enable row level security;

-- Policies for PROFILES
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins can update profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Policies for TICKETS
create policy "Users can view own tickets" on tickets for select using (auth.uid() = user_id);
create policy "Users can insert own tickets" on tickets for insert with check (auth.uid() = user_id);
create policy "Admins can view all tickets" on tickets for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins can update tickets" on tickets for update using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Policies for WORK_LOGS
create policy "Users can view logs of their tickets" on work_logs for select using (
  exists (select 1 from tickets where tickets.id = work_logs.ticket_id and tickets.user_id = auth.uid())
);
create policy "Admins can manage work logs" on work_logs for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Policies for PAYMENTS
create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);
create policy "Admins can manage payments" on payments for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migration: Create profiles for existing users who don't have one
insert into public.profiles (id, full_name, email)
select id, raw_user_meta_data->>'full_name', email
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do update 
set email = excluded.email;

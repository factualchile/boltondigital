-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- User Profiles (Extends Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  paypal_account text,
  role text check (role in ('user', 'freelancer', 'admin')) default 'user',
  access_level integer default 1, -- 1: User, 2: Freelancer, 3: Admin
  total_minutes_used integer default 0,
  total_usd_spent decimal(10,2) default 0.00,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist
alter table profiles add column if not exists email text;
alter table profiles add column if not exists role text check (role in ('user', 'freelancer', 'admin')) default 'user';

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
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  finished_at timestamp with time zone
);

-- Ensure finished_at exists
alter table tickets add column if not exists finished_at timestamp with time zone;

-- Ticket Time Logs
create table if not exists work_logs (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  minutes_spent integer not null,
  description text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

-- PROFILES Policies
create policy "p_self" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "p_admin" on profiles for select using (role = 'admin');

-- TICKETS Policies
create policy "t_self" on tickets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "t_privileged" on tickets for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('freelancer', 'admin'))
);

-- WORK_LOGS Policies
create policy "l_view" on work_logs for select using (true);
create policy "l_manage" on work_logs for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('freelancer', 'admin'))
);

-- PAYMENTS Policies
create policy "pay_self" on payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pay_admin" on payments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migration: Create profiles for existing users who don't have one
insert into public.profiles (id, full_name, email, role)
select id, raw_user_meta_data->>'full_name', email, 'user'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do update 
set email = excluded.email;

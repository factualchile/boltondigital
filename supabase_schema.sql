-- User Profiles (Extends Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  paypal_account text,
  is_admin boolean default false,
  total_minutes_used integer default 0,
  total_usd_spent decimal(10,2) default 0.00,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tickets Table
create table tickets (
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
create table work_logs (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  minutes_spent integer not null,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payment Verifications
create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  screenshot_url text not null,
  payment_date date not null,
  paypal_name text not null,
  status text check (status in ('Pendiente', 'Validado', 'Rechazado')) default 'Pendiente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Basic setup
alter table profiles enable row level security;
alter table tickets enable row level security;
alter table work_logs enable row level security;
alter table payments enable row level security;

-- Policies (Example: Users see their own data, Admins see everything)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can view own tickets" on tickets for select using (auth.uid() = user_id);
create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);

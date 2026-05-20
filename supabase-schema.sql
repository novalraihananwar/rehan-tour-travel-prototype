-- ============================================================
-- Rehan Tour & Travel — Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- 1. DRIVERS
create table if not exists drivers (
  id          uuid primary key default gen_random_uuid(),
  username    text unique not null,
  pin_hash    text not null,        -- store bcrypt hash, never plain PIN
  name        text not null,
  vehicle_id  text not null,        -- e.g. RTT-001
  phone       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Seed demo drivers (PIN: RTT2026 stored as plain for now — hash before production)
insert into drivers (username, pin_hash, name, vehicle_id, phone) values
  ('budi.santoso',  'RTT2026', 'Budi Santoso',  'RTT-001', '+628111000001'),
  ('andi.wijaya',   'RTT2026', 'Andi Wijaya',   'RTT-002', '+628111000002'),
  ('rudi.hartono',  'RTT2026', 'Rudi Hartono',  'RTT-003', '+628111000003'),
  ('demo',          '1234',    'Driver Demo',   'RTT-DEMO', '+628111000099')
on conflict (username) do nothing;


-- 2. BOOKINGS
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,             -- RTT-XXXXXX
  package_id      text not null,
  package_title   text not null,
  date            date,
  guests          int not null default 1,
  pickup_name     text,
  pickup_address  text,
  pickup_fee_usd  numeric(10,2) default 0,
  pickup_custom   boolean default false,
  name            text not null,
  email           text not null,
  whatsapp        text not null,
  special_request text,
  payment_method  text default 'bank-transfer',
  total_usd       numeric(10,2) not null,
  status          text default 'pending',           -- pending | confirmed | on-trip | completed | cancelled
  driver_id       uuid references drivers(id),
  created_at      timestamptz default now()
);


-- 3. DRIVER LOCATIONS (GPS history per booking)
create table if not exists driver_locations (
  id           bigint primary key generated always as identity,
  booking_code text not null,
  driver_id    uuid references drivers(id),
  driver_name  text,
  lat          double precision not null,
  lng          double precision not null,
  status       text default 'en-route',
  recorded_at  timestamptz default now()
);

-- 4. TOUR PACKAGES (admin editable — overrides hardcoded data)
create table if not exists tour_packages (
  id              text primary key,
  slug            text unique not null,
  title           text not null,
  subtitle        text,
  cover_image     text,
  type            text default 'shared',
  duration        text,
  duration_days   int default 1,
  max_group_size  int default 13,
  price_usd       numeric(10,2),
  price_idr       numeric(15,2),
  original_price_usd numeric(10,2),
  rating          numeric(3,1) default 4.9,
  review_count    int default 0,
  available_seats int default 13,
  total_seats     int default 13,
  next_departure  date,
  route_description text,
  tags            jsonb default '[]',
  highlights      jsonb default '[]',
  included        jsonb default '[]',
  excluded        jsonb default '[]',
  itinerary       jsonb default '[]',
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table tour_packages enable row level security;
create policy "Public can read active packages"
  on tour_packages for select to anon
  using (is_active = true);
create policy "Service role full access packages"
  on tour_packages for all to service_role using (true);


-- Index for fast lookup by booking code
create index if not exists idx_driver_locations_code
  on driver_locations(booking_code, recorded_at desc);


-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table drivers          enable row level security;
alter table bookings         enable row level security;
alter table driver_locations enable row level security;

-- Bookings: anyone can insert (public booking form), only service_role can read all
create policy "Public can insert bookings"
  on bookings for insert to anon with check (true);

create policy "Users can read own booking by code"
  on bookings for select to anon
  using (true);   -- allow tracker page to read by code — tighten later

-- Driver locations: anon can insert (driver GPS) and read (tracker page)
create policy "Anon can insert locations"
  on driver_locations for insert to anon with check (true);

create policy "Anon can read locations"
  on driver_locations for select to anon using (true);

-- Drivers: only service_role can read (login check via API route)
create policy "Service role only for drivers"
  on drivers for all to service_role using (true);

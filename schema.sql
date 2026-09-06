-- BHRP Core Database Schema for Supabase (PostgreSQL)
-- Copy and paste this script into Supabase -> SQL Editor -> Run

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    discord_tag TEXT NOT NULL,
    ingame_id TEXT NOT NULL,
    rank TEXT NOT NULL DEFAULT 'Member', -- 'Leader', 'High Command', 'Officer', 'Member', 'Recruit'
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'On Leave', 'Inactive'
    strikes INT DEFAULT 0,
    xp INT DEFAULT 100,
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    game TEXT NOT NULL, -- 'GTA V RP', 'ETS2 Convoy', 'TruckersMP', 'Other'
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    route_details TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'Upcoming', -- 'Upcoming', 'Live', 'Completed', 'Cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Event Role Slots Table
CREATE TABLE IF NOT EXISTS public.event_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL, -- 'Pilot / Lead', 'Heavy Cargo', 'Escort Guard', 'Rear Sweeper', 'Member Slot'
    claimed_by_name TEXT,
    claimed_by_id TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE
);

-- Seed Initial Data for BHRP Core
INSERT INTO public.organizations (name, tag, logo_url)
VALUES ('Black Hawk RolePlay', 'BHRP', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80')
ON CONFLICT DO NOTHING;

INSERT INTO public.members (name, discord_tag, ingame_id, rank, status, strikes, xp, joined_date)
VALUES 
('Rafay King', 'rafay#0001', 'BH-101', 'Leader', 'Active', 0, 1450, '2024-01-15'),
('Imran Khan', 'imran#1234', 'BH-102', 'High Command', 'Active', 0, 1200, '2024-02-01'),
('Daniyal Shah', 'daniyal#9999', 'BH-105', 'Officer', 'Active', 1, 850, '2024-03-10'),
('Zain Malik', 'zain#5544', 'BH-112', 'Member', 'Active', 0, 420, '2024-04-18'),
('Hamza Ali', 'hamza#8811', 'BH-120', 'Recruit', 'On Leave', 2, 180, '2024-05-02')
ON CONFLICT DO NOTHING;

INSERT INTO public.events (title, game, event_date, route_details, image_url, status)
VALUES 
('Mega City Patrol & Cargo Convoy', 'GTA V RP', NOW() + INTERVAL '2 days', 'Paleto Bay to Los Santos Port via Highway 68', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80', 'Upcoming'),
('Euro Truck Simulator 2 Euro-Highway Rally', 'ETS2 Convoy', NOW() + INTERVAL '5 days', 'Berlin to Paris via Luxembourg (Server 1)', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80', 'Upcoming')
ON CONFLICT DO NOTHING;

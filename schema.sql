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
    description TEXT DEFAULT 'Official Gaming Family & RolePlay Squad',
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

-- 6. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    ingame_id TEXT DEFAULT 'BH-NEW',
    rank TEXT DEFAULT 'Member',
    account_type TEXT DEFAULT 'Unassigned', -- 'Unassigned', 'Member', 'Family Leader', 'Root Admin'
    is_root_admin BOOLEAN DEFAULT false,
    current_family_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    applied_family_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    application_status TEXT DEFAULT 'None', -- 'None', 'Pending', 'Approved', 'Rejected'
    discord_tag TEXT,
    bio TEXT DEFAULT 'BHRP Family Member',
    xp INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Family Join Applications Table
CREATE TABLE IF NOT EXISTS public.family_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    discord_tag TEXT,
    ingame_id TEXT,
    message TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_root BOOL := false;
  acc_type TEXT := 'Unassigned';
BEGIN
  IF lower(new.email) = 'basharat81253@gmail.com' THEN
    is_root := true;
    acc_type := 'Root Admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, discord_tag, is_root_admin, account_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '#0000',
    is_root,
    acc_type
  )
  ON CONFLICT (id) DO UPDATE SET
    is_root_admin = EXCLUDED.is_root_admin,
    account_type = CASE WHEN EXCLUDED.is_root_admin THEN 'Root Admin' ELSE profiles.account_type END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Initial Data for BHRP Core
INSERT INTO public.organizations (name, tag, logo_url, description)
VALUES ('Black Hawk RolePlay', 'BHRP', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80', 'Elite GTA V RolePlay & Heavy Cargo Convoy Squad')
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

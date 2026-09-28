-- =========================================================================
-- DIAMOND JAY ENTERPRISE — Supabase PostgreSQL Database Schema & Seed Data
-- Location: 410 New Road, Accra, Ghana
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES public.categories(slug) ON DELETE CASCADE ON UPDATE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    volume TEXT NOT NULL,
    alcohol_percentage NUMERIC(4, 1),
    origin_country TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. USERS TABLE (Single Owner, Staff, and Customers)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup')),
    delivery_details JSONB,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
    payment_method TEXT,
    paystack_reference TEXT,
    paystack_paid_at TIMESTAMP WITH TIME ZONE,
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'out_for_delivery', 'ready_for_pickup', 'completed', 'cancelled')),
    age_confirmed BOOLEAN NOT NULL DEFAULT true,
    cancellation_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refunded_by TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary_store',
    store_name TEXT NOT NULL,
    tagline TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL,
    min_order_age INTEGER DEFAULT 18,
    business_hours JSONB NOT NULL DEFAULT '[]'::jsonb,
    delivery_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    announcement_banner JSONB NOT NULL DEFAULT '{"enabled": true, "text": ""}'::jsonb,
    paystack_public_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) and public access policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow full read access for all tables via anon key
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);

-- Allow full modify permissions for products and categories (for Staff/Owner via app)
CREATE POLICY "Public Modify Products" ON public.products FOR ALL USING (true);
CREATE POLICY "Public Modify Categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Public Modify Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Modify Settings" ON public.store_settings FOR ALL USING (true);


-- =========================================================================
-- SEED INITIAL DATA
-- =========================================================================

-- 1. Categories
INSERT INTO public.categories (id, name, slug, description, image) VALUES
('cat_whisky_spirits', 'Whisky & Spirits', 'whisky-spirits', 'Single malts, blended scotch, bourbon, gin, rum, and vodka.', 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=600&q=80'),
('cat_wines', 'Fine Wines', 'wines', 'Curated red, white, rosé, and sweet dessert wines.', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'),
('cat_champagne', 'Champagnes & Sparkling', 'champagnes', 'Prestige champagnes, prosecco, and sparkling celebration wines.', 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=600&q=80'),
('cat_beer_cider', 'Beers & Ciders', 'beers-ciders', 'Chilled local Ghanaian brews, international draughts, and ciders.', 'https://images.unsplash.com/photo-1608270199042-45e0f73fce81?auto=format&fit=crop&w=600&q=80'),
('cat_liqueurs_bitters', 'Liqueurs & Local Bitters', 'liqueurs-bitters', 'Cream liqueurs, herbal aperitifs, and renowned authentic Ghanaian bitters.', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80'),
('cat_soft_drinks', 'Mixers & Soft Drinks', 'mixers-soft-drinks', 'Tonic waters, sodas, energy drinks, and cocktail mixers.', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. Products
INSERT INTO public.products (id, name, category, price, stock_quantity, volume, alcohol_percentage, origin_country, image_url, description, is_featured, is_active) VALUES
('prod_jw_black', 'Johnnie Walker Black Label 12 Year Old', 'whisky-spirits', 450.00, 28, '750ml', 40.0, 'Scotland', 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80', 'An iconic blend of up to 40 whiskies aged for at least 12 years. Rich, complex, and signature smokiness.', true, true),
('prod_jameson', 'Jameson Irish Whiskey', 'whisky-spirits', 360.00, 45, '750ml', 40.0, 'Ireland', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=800&q=80', 'Triple-distilled Irish whiskey that is as smooth as it is versatile.', true, true),
('prod_hennessy_vs', 'Hennessy Very Special (VS) Cognac', 'whisky-spirits', 680.00, 20, '750ml', 40.0, 'France', 'https://images.unsplash.com/photo-1582819509241-913417cba4b4?auto=format&fit=crop&w=800&q=80', 'A timeless benchmark in cognac with vibrant notes of toasted oak and roasted almonds.', true, true),
('prod_club_bottle', 'Club Premium Lager Beer (Single Bottle)', 'beers-ciders', 18.00, 150, '625ml', 5.0, 'Ghana', 'https://images.unsplash.com/photo-1608270199042-45e0f73fce81?auto=format&fit=crop&w=800&q=80', 'Ghana’s pride and joy! Brewed with finest hops and golden malted barley.', true, true),
('prod_club_crate', 'Club Premium Lager (Full Crate — 12 Large Bottles)', 'beers-ciders', 210.00, 40, '12 x 625ml', 5.0, 'Ghana', 'https://images.unsplash.com/photo-1538488881523-298a007c0330?auto=format&fit=crop&w=800&q=80', 'Wholesale pack for parties and events. Includes 12 large chilled bottles of Club Beer.', false, true),
('prod_guinness_extra', 'Guinness Foreign Extra Stout', 'beers-ciders', 22.00, 110, '330ml', 7.5, 'Ghana / Ireland', 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=800&q=80', 'Rich, dark, and deeply rewarding with bitter-sweet character and intense roasted coffee notes.', true, true),
('prod_casillero_cabernet', 'Casillero del Diablo Cabernet Sauvignon', 'wines', 165.00, 60, '750ml', 13.5, 'Chile', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', 'Chilean classic deep ruby red wine with intense aromas of cherries and black plums.', true, true),
('prod_moet_imperial', 'Moët & Chandon Brut Impérial Champagne', 'champagnes', 1250.00, 14, '750ml', 12.0, 'France', 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80', 'The house’s iconic champagne with bright fruitiness, seductive palate, and elegant maturity.', true, true),
('prod_alomo_bitters', 'Alomo Bitters Herbal Alcoholic Drink', 'liqueurs-bitters', 45.00, 90, '750ml', 42.0, 'Ghana', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', 'Ghana’s world-acclaimed traditional herbal formulation made with therapeutic plant extracts.', true, true),
('prod_schweppes_tonic', 'Schweppes Indian Tonic Water (Pack of 6)', 'mixers-soft-drinks', 60.00, 80, '6 x 330ml', 0.0, 'Ghana', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', 'Classic effervescent tonic with pleasant bitter quinine notes. Essential mixer for dry gins.', false, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Users (Initial Owner: owner@diamondjay.com / Password@123, Staff: staff@diamondjay.com / Password@123)
-- PasswordHash is bcrypt hash for "Password@123"
INSERT INTO public.users (id, name, email, phone, password_hash, role) VALUES
('usr_owner_1', 'Jay Diamond (Proprietor)', 'owner@diamondjay.com', '+233 248 565 916', '$2b$10$wI3UYTAve4qD4Y/9GpJk5OtYfcx1NNamo8cPS/1hdsIQtbGlMvp8K', 'owner'),
('usr_staff_1', 'Kwame Mensah', 'staff@diamondjay.com', '+233241000002', '$2b$10$wI3UYTAve4qD4Y/9GpJk5OtYfcx1NNamo8cPS/1hdsIQtbGlMvp8K', 'staff'),
('usr_customer_1', 'Akosua Serwaa', 'customer@diamondjay.com', '+233241000003', '$2b$10$wI3UYTAve4qD4Y/9GpJk5OtYfcx1NNamo8cPS/1hdsIQtbGlMvp8K', 'customer')
ON CONFLICT (id) DO NOTHING;

-- 4. Store Settings
INSERT INTO public.store_settings (
    id, store_name, tagline, address, city, country, phone, whatsapp, email, min_order_age, business_hours, delivery_zones, announcement_banner
) VALUES (
    'primary_store',
    'Diamond Jay Enterprise',
    'Premium Wines, Spirits, Beers & Liquors in Accra',
    '410 New Road',
    'Accra',
    'Ghana',
    '+233 248 565 916',
    '+233 248 565 916',
    'orders@diamondjay.com',
    18,
    '[{"day": "Monday - Thursday", "open": "07:00 AM", "close": "09:00 PM"}, {"day": "Friday - Saturday", "open": "07:00 AM", "close": "09:00 PM"}, {"day": "Sunday", "open": "07:00 AM", "close": "09:00 PM"}]'::jsonb,
    '[{"id": "zone_central", "name": "Accra Central & Surroundings", "areas": ["Osu", "Cantonments", "Labone", "Adabraka", "Ridge", "Airport Residential"], "fee": 25, "estimatedTime": "30 - 45 mins"}, {"id": "zone_suburban_east", "name": "East Legon & Spintex Corridor", "areas": ["East Legon", "Adjiringanor", "Spintex Road", "Tema Comm 1-12", "Sakumono"], "fee": 40, "estimatedTime": "45 - 60 mins"}, {"id": "zone_outer", "name": "Greater Accra Outer Zones", "areas": ["Madina", "Adenta", "Achimota", "Dansoman", "Kasoa Road", "Dome"], "fee": 60, "estimatedTime": "60 - 90 mins"}]'::jsonb,
    '{"enabled": true, "text": "🎉 Welcome to Diamond Jay Enterprise! Fast delivery across Accra & free in-store pickup at 410 New Road."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

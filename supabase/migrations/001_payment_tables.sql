-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Orders table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_lastname text NOT NULL,
  customer_dni text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  total numeric NOT NULL,
  coupon_code text REFERENCES coupons(code),
  payment_method text NOT NULL CHECK (payment_method IN ('mp', 'transfer')),
  mp_preference_id text,
  mp_payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'pending_transfer', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (to validate)
CREATE POLICY "read active coupons" ON coupons FOR SELECT USING (active = true);

-- Anyone can insert orders
CREATE POLICY "insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Users can read their own orders by email
CREATE POLICY "read own orders" ON orders FOR SELECT USING (
  customer_email = auth.jwt() ->> 'email'
);

-- Sample coupons for testing
INSERT INTO coupons (code, discount_type, discount_value, max_uses, active)
VALUES
  ('WATO10', 'percent', 10, 100, true),
  ('BIENVENIDO', 'fixed', 500, 50, true),
  ('GAMER20', 'percent', 20, 30, true)
ON CONFLICT (code) DO NOTHING;

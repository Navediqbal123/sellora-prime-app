-- Ensures orders.pickup_code is generated server-side with a cryptographically
-- secure random value instead of relying on client-supplied input.
-- Run this against the external Supabase project via the SQL editor.
ALTER TABLE orders
  ALTER COLUMN pickup_code
  SET DEFAULT encode(gen_random_bytes(4), 'hex');

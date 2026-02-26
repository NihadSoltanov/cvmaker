-- Run in Supabase SQL Editor to add is_paid column

-- Add is_paid boolean to profiles (defaults to false = free user)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false;

-- To test Pro features for your account, run:
-- UPDATE profiles SET is_paid = true WHERE email = 'your-email@example.com';

-- To revert back to free:
-- UPDATE profiles SET is_paid = false WHERE email = 'your-email@example.com';

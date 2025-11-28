-- Migration: Add is_featured column to listings table
-- This migration adds support for premium users to feature their listings

-- Add is_featured column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for better query performance when filtering featured listings
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON listings(is_featured);

-- Add comment to document the column
COMMENT ON COLUMN listings.is_featured IS 'Indicates if the listing is featured (premium feature)';


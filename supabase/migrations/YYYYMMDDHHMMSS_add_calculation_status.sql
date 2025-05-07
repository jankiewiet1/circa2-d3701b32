-- Define an ENUM type for calculation statuses
CREATE TYPE public.calculation_status AS ENUM (
    'pending',      -- Initial state after entry insertion
    'matched',      -- Factors found and calculation successful
    'factor_not_found', -- No matching emission factor could be located
    'error'         -- An error occurred during calculation
);

-- Add the status column to the emission_calculations table
ALTER TABLE public.emission_calculations
ADD COLUMN status public.calculation_status NOT NULL DEFAULT 'pending';

-- Optional: Add an index on the new status column if you query by it often
-- CREATE INDEX idx_emission_calculations_status ON public.emission_calculations(status); 
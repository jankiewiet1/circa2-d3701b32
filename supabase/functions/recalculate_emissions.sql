
-- This function recalculates emissions for all scope1_emissions for a given company
CREATE OR REPLACE FUNCTION public.recalculate_scope1_emissions(p_company_id UUID)
RETURNS SETOF scope1_emissions
LANGUAGE plpgsql
AS $$
DECLARE
  emission RECORD;
  emission_factor FLOAT;
  factor_source TEXT;
  latest_year INT;
BEGIN
  -- Get company's preferred emission source
  SELECT preferred_emission_source INTO factor_source
  FROM public.company_preferences
  WHERE company_id = p_company_id;
  
  -- Default to DEFRA if not set
  IF factor_source IS NULL THEN
    factor_source := 'DEFRA';
  END IF;
  
  -- Process each emission record
  FOR emission IN 
    SELECT * FROM scope1_emissions 
    WHERE company_id = p_company_id 
  LOOP
    -- Find the latest year available for this fuel type, unit and source
    SELECT MAX(year) INTO latest_year
    FROM public.emission_factors
    WHERE fuel_type = emission.fuel_type
      AND unit = emission.unit
      AND source = factor_source;
      
    -- Get the emission factor
    SELECT factor_per_unit INTO emission_factor
    FROM public.emission_factors
    WHERE fuel_type = emission.fuel_type
      AND unit = emission.unit
      AND source = factor_source
      AND year = latest_year;
      
    -- If we found an emission factor, calculate the emissions
    IF emission_factor IS NOT NULL AND emission.amount IS NOT NULL THEN
      -- Calculate emissions: (amount * factor_per_unit) / 1000 to convert kg to tonnes
      UPDATE scope1_emissions
      SET 
        emissions_co2e = (emission.amount * emission_factor) / 1000,
        emission_factor_source = factor_source
      WHERE id = emission.id;
    END IF;
    
    RETURN NEXT emission;
  END LOOP;
  
  RETURN;
END;
$$;

-- Ensure the update_scope1_emissions trigger function captures the proper values
CREATE OR REPLACE FUNCTION public.update_scope1_emissions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  emission_factor FLOAT;
  factor_source TEXT;
  latest_year INT;
  company_source TEXT;
BEGIN
  -- Get company's preferred emission source
  SELECT preferred_emission_source INTO company_source
  FROM public.company_preferences
  WHERE company_id = NEW.company_id;
  
  IF company_source IS NULL THEN
    company_source := 'DEFRA'; -- Default if not set
  END IF;
  
  -- Find the latest year available for this fuel type, unit and source
  SELECT MAX(year) INTO latest_year
  FROM public.emission_factors
  WHERE fuel_type = NEW.fuel_type
    AND unit = NEW.unit
    AND source = company_source;
    
  -- Get the emission factor
  SELECT factor_per_unit INTO emission_factor
  FROM public.emission_factors
  WHERE fuel_type = NEW.fuel_type
    AND unit = NEW.unit
    AND source = company_source
    AND year = latest_year;
    
  -- If we found an emission factor, calculate the emissions
  IF emission_factor IS NOT NULL AND NEW.amount IS NOT NULL THEN
    -- Calculate emissions: (amount * factor_per_unit) / 1000 to convert kg to tonnes
    NEW.emissions_co2e := (NEW.amount * emission_factor) / 1000;
    NEW.emission_factor_source := company_source;
  END IF;
  
  RETURN NEW;
END;
$$;

-- If the trigger doesn't exist yet, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'scope1_emissions_calculation_trigger'
  ) THEN
    CREATE TRIGGER scope1_emissions_calculation_trigger
    BEFORE INSERT OR UPDATE
    ON public.scope1_emissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_scope1_emissions();
  END IF;
END
$$;

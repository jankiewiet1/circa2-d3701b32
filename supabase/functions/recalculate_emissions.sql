
-- This function recalculates emissions for all scope1_emissions for a given company
CREATE OR REPLACE FUNCTION public.recalculate_scope1_emissions(p_company_id UUID)
RETURNS SETOF scope1_emissions
LANGUAGE plpgsql
AS $$
DECLARE
  emission RECORD;
  emission_factor FLOAT;
  factor_source TEXT;
  fallback_source TEXT := 'GHG Protocol Default';
  latest_year INT;
  matched_count INT := 0;
  fallback_count INT := 0;
  unmatched_count INT := 0;
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
    -- Use LOWER() and TRIM() for case-insensitive, whitespace-insensitive matching
    SELECT MAX(year) INTO latest_year
    FROM public.emission_factors
    WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(emission.fuel_type))
      AND LOWER(TRIM(unit)) = LOWER(TRIM(emission.unit))
      AND source = factor_source;
      
    -- Get the emission factor
    SELECT factor_per_unit INTO emission_factor
    FROM public.emission_factors
    WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(emission.fuel_type))
      AND LOWER(TRIM(unit)) = LOWER(TRIM(emission.unit))
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
      
      matched_count := matched_count + 1;
    ELSE
      -- Try fallback to GHG Protocol Default
      SELECT MAX(year) INTO latest_year
      FROM public.emission_factors
      WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(emission.fuel_type))
        AND LOWER(TRIM(unit)) = LOWER(TRIM(emission.unit))
        AND source = fallback_source;
        
      SELECT factor_per_unit INTO emission_factor
      FROM public.emission_factors
      WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(emission.fuel_type))
        AND LOWER(TRIM(unit)) = LOWER(TRIM(emission.unit))
        AND source = fallback_source
        AND year = latest_year;
        
      IF emission_factor IS NOT NULL AND emission.amount IS NOT NULL THEN
        -- Calculate using fallback source
        UPDATE scope1_emissions
        SET 
          emissions_co2e = (emission.amount * emission_factor) / 1000,
          emission_factor_source = fallback_source
        WHERE id = emission.id;
        
        fallback_count := fallback_count + 1;
        
        -- Log that we used fallback
        INSERT INTO public.calculation_logs (
          company_id,
          log_type,
          log_message,
          related_id
        ) VALUES (
          p_company_id,
          'info',
          'Used fallback source ' || fallback_source || ' for: ' || emission.fuel_type || ' - ' || emission.unit || ' (preferred source ' || factor_source || ' not found)',
          emission.id
        );
      ELSE
        -- Log if still no matching emission factor was found
        INSERT INTO public.calculation_logs (
          company_id,
          log_type,
          log_message,
          related_id
        ) VALUES (
          p_company_id,
          'warning',
          'No matching emission factor found for: ' || emission.fuel_type || ' - ' || emission.unit || ' - ' || factor_source || ' or ' || fallback_source,
          emission.id
        );
        
        unmatched_count := unmatched_count + 1;
      END IF;
    END IF;
    
    RETURN NEXT emission;
  END LOOP;
  
  -- Log summary of the recalculation
  INSERT INTO public.calculation_logs (
    company_id,
    log_type,
    log_message
  ) VALUES (
    p_company_id,
    'info',
    'Recalculation completed. Matched: ' || matched_count || ', Used fallback: ' || fallback_count || ', Unmatched: ' || unmatched_count
  );
  
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
  fallback_source TEXT := 'GHG Protocol Default';
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
  -- Use LOWER() and TRIM() for case-insensitive, whitespace-insensitive matching
  SELECT MAX(year) INTO latest_year
  FROM public.emission_factors
  WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(NEW.fuel_type))
    AND LOWER(TRIM(unit)) = LOWER(TRIM(NEW.unit))
    AND source = company_source;
    
  -- Get the emission factor
  SELECT factor_per_unit INTO emission_factor
  FROM public.emission_factors
  WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(NEW.fuel_type))
    AND LOWER(TRIM(unit)) = LOWER(TRIM(NEW.unit))
    AND source = company_source
    AND year = latest_year;
    
  -- If we found an emission factor, calculate the emissions
  IF emission_factor IS NOT NULL AND NEW.amount IS NOT NULL THEN
    -- Calculate emissions: (amount * factor_per_unit) / 1000 to convert kg to tonnes
    NEW.emissions_co2e := (NEW.amount * emission_factor) / 1000;
    NEW.emission_factor_source := company_source;
  ELSE
    -- Try fallback to GHG Protocol Default
    SELECT MAX(year) INTO latest_year
    FROM public.emission_factors
    WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(NEW.fuel_type))
      AND LOWER(TRIM(unit)) = LOWER(TRIM(NEW.unit))
      AND source = fallback_source;
      
    SELECT factor_per_unit INTO emission_factor
    FROM public.emission_factors
    WHERE LOWER(TRIM(fuel_type)) = LOWER(TRIM(NEW.fuel_type))
      AND LOWER(TRIM(unit)) = LOWER(TRIM(NEW.unit))
      AND source = fallback_source
      AND year = latest_year;
      
    IF emission_factor IS NOT NULL AND NEW.amount IS NOT NULL THEN
      -- Calculate using fallback source
      NEW.emissions_co2e := (NEW.amount * emission_factor) / 1000;
      NEW.emission_factor_source := fallback_source;
      
      -- Log that we used fallback
      INSERT INTO public.calculation_logs (
        company_id,
        user_id,
        log_type,
        log_message,
        related_id
      ) VALUES (
        NEW.company_id,
        NEW.uploaded_by,
        'info',
        'Used fallback source ' || fallback_source || ' for: ' || NEW.fuel_type || ' - ' || NEW.unit || ' (preferred source ' || company_source || ' not found)',
        NEW.id
      );
    ELSE
      -- Log if no matching emission factor was found
      INSERT INTO public.calculation_logs (
        company_id,
        user_id,
        log_type,
        log_message,
        related_id
      ) VALUES (
        NEW.company_id,
        NEW.uploaded_by,
        'warning',
        'No matching emission factor found for: ' || NEW.fuel_type || ' - ' || NEW.unit || ' - ' || company_source || ' or ' || fallback_source,
        NEW.id
      );
    END IF;
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

-- Create an index on emission_factors for better performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'emission_factors'
      AND indexname = 'emission_factors_lookup_idx'
  ) THEN
    CREATE INDEX emission_factors_lookup_idx ON public.emission_factors (fuel_type, unit, source, year);
  END IF;
END
$$;

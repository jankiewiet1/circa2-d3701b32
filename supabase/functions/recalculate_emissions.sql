
CREATE OR REPLACE FUNCTION public.recalculate_scope1_emissions(p_company_id UUID)
RETURNS SETOF scope1_emissions
LANGUAGE plpgsql
AS $$
DECLARE
  emission RECORD;
  emission_factor FLOAT;
  factor_source TEXT;
  fallback_source TEXT := 'GHG Protocol Default';
  latest_year INT := 2024;  -- Default to using 2024 data
  matched_count INT := 0;
  fallback_count INT := 0;
  unmatched_count INT := 0;
BEGIN
  -- Get company's preferred emission source
  SELECT preferred_emission_source INTO factor_source
  FROM public.company_preferences
  WHERE company_id = p_company_id;

  IF factor_source IS NULL THEN
    factor_source := 'DEFRA'; -- default fallback
  END IF;

  -- Loop through all Scope 1 emissions for the company
  FOR emission IN 
    SELECT * FROM public.scope1_emissions
    WHERE company_id = p_company_id
  LOOP
    -- Try to find matching emission factor for the preferred source, year 2024 and scope 1
    SELECT ef.emission_factor INTO emission_factor
    FROM public.emission_factors ef
    WHERE LOWER(TRIM(ef.fuel_type)) = LOWER(TRIM(emission.fuel_type))
      AND LOWER(TRIM(ef.unit)) = LOWER(TRIM(emission.unit))
      AND ef.source = factor_source
      AND ef.scope = '1'
      AND ef.year = latest_year;

    -- Primary factor found
    IF emission_factor IS NOT NULL THEN
      UPDATE scope1_emissions
      SET emissions_co2e = (emission.amount * emission_factor),
          emission_factor_source = factor_source
      WHERE id = emission.id;

      matched_count := matched_count + 1;

    -- Try fallback if no primary factor
    ELSE
      SELECT ef.emission_factor INTO emission_factor
      FROM public.emission_factors ef
      WHERE LOWER(TRIM(ef.fuel_type)) = LOWER(TRIM(emission.fuel_type))
        AND LOWER(TRIM(ef.unit)) = LOWER(TRIM(emission.unit))
        AND ef.source = fallback_source
        AND ef.scope = '1'
        AND ef.year = latest_year;

      IF emission_factor IS NOT NULL THEN
        UPDATE scope1_emissions
        SET emissions_co2e = (emission.amount * emission_factor),
            emission_factor_source = fallback_source
        WHERE id = emission.id;

        fallback_count := fallback_count + 1;

        INSERT INTO public.calculation_logs (
          company_id,
          log_type,
          log_message,
          related_id
        ) VALUES (
          p_company_id,
          'info',
          'Used fallback source: ' || fallback_source || ' for ' || emission.fuel_type || ' (' || emission.unit || ')',
          emission.id
        );
      ELSE
        unmatched_count := unmatched_count + 1;

        INSERT INTO public.calculation_logs (
          company_id,
          log_type,
          log_message,
          related_id
        ) VALUES (
          p_company_id,
          'warning',
          'No emission factor found for ' || emission.fuel_type || ' (' || emission.unit || ') in source: ' || factor_source || ' or fallback: ' || fallback_source,
          emission.id
        );
      END IF;
    END IF;

    RETURN NEXT emission;
  END LOOP;

  -- Log summary
  INSERT INTO public.calculation_logs (
    company_id,
    log_type,
    log_message
  ) VALUES (
    p_company_id,
    'info',
    'Recalculation complete: Matched = ' || matched_count || ', Fallback = ' || fallback_count || ', Unmatched = ' || unmatched_count
  );

  RETURN;
END;
$$;

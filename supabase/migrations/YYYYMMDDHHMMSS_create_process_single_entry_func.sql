CREATE OR REPLACE FUNCTION public.process_single_emission_entry(p_entry_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Use definer security if function needs elevated privileges (e.g., to emission_factors)
-- SET search_path = public; -- Uncomment if needed
AS $$
DECLARE
    v_entry emission_entries%ROWTYPE;
    v_factors_array NUMERIC[];
    v_source TEXT;
    v_status calculation_status := 'pending';
    v_co2_factor NUMERIC;
    v_ch4_factor NUMERIC;
    v_n2o_factor NUMERIC;
    v_co2_emissions NUMERIC;
    v_ch4_emissions NUMERIC;
    v_n2o_emissions NUMERIC;
    v_total_emissions NUMERIC;
BEGIN
    -- 1. Get the emission entry details
    SELECT * INTO v_entry FROM emission_entries WHERE id = p_entry_id;
    IF NOT FOUND THEN
        RAISE WARNING 'Emission entry with ID % not found.', p_entry_id;
        RETURN;
    END IF;

    -- 2. Get the company's preferred emission source
    SELECT cp.preferred_emission_source INTO v_source
    FROM company_preferences cp 
    WHERE cp.company_id = v_entry.company_id;

    IF v_source IS NULL THEN
        RAISE WARNING 'No preferred emission source found for company % associated with entry %.', v_entry.company_id, p_entry_id;
        v_status := 'error'; -- Or 'factor_not_found' depending on desired behavior
        GOTO upsert_calculation; -- Jump to upsert with error status
    END IF;

    -- 3. Find Emission Factors (Adapted Logic - simplified for clarity, review/adjust needed)
    --    This section needs careful review based on your exact factor table structure and matching needs.
    --    The original logic with CASE and ILIKE is kept but might need improvement.
    BEGIN
        SELECT 
            CASE 
                WHEN v_entry.category ILIKE '%flight%' OR v_entry.category ILIKE '%air%' THEN (
                    SELECT array_agg(ef."GHG Conversion Factor 2024" ORDER BY ef."GHG/Unit")
                    FROM emission_factors ef 
                    WHERE 
                        ef.category_1 ILIKE '%air%' 
                        AND ef.category_2 ILIKE '%flight%'
                        AND (
                            CASE 
                                WHEN v_entry.description ILIKE '%domestic%' OR v_entry.description ILIKE '%local%' OR v_entry.description ILIKE '%paris%' THEN ef.category_3 ILIKE '%domestic%'
                                WHEN v_entry.description ILIKE '%international%' OR v_entry.description ILIKE '%foreign%' THEN ef.category_3 ILIKE '%international%'
                                ELSE true
                            END
                        )
                        AND ef.scope = 'Scope ' || v_entry.scope::text
                        AND ef."Source" = v_source
                        AND ef."GHG/Unit" IN ('kg CO2e of CO2 per unit', 'kg CO2e of CH4 per unit', 'kg CO2e of N2O per unit')
                    LIMIT 3
                )
                WHEN v_entry.category ILIKE '%electric%' THEN (
                    SELECT array_agg(ef."GHG Conversion Factor 2024" ORDER BY ef."GHG/Unit")
                    FROM emission_factors ef 
                    WHERE 
                        ef.category_1 ILIKE '%electricity%'
                        AND ef.scope = 'Scope ' || v_entry.scope::text
                        AND ef."Source" = v_source
                        AND ef."GHG/Unit" IN ('kg CO2e of CO2 per unit', 'kg CO2e of CH4 per unit', 'kg CO2e of N2O per unit')
                    LIMIT 3
                )
                WHEN v_entry.category ILIKE '%diesel%' OR v_entry.category ILIKE '%fuel%' THEN (
                    SELECT array_agg(ef."GHG Conversion Factor 2024" ORDER BY ef."GHG/Unit")
                    FROM emission_factors ef 
                    WHERE 
                        ef.category_1 = 'Fuels'
                        AND ef.category_2 = 'Liquid fuels'
                        AND ef.category_3 ILIKE '%diesel%'
                        AND ef.scope = 'Scope ' || v_entry.scope::text
                        AND ef."Source" = v_source
                        AND ef."GHG/Unit" IN ('kg CO2e of CO2 per unit', 'kg CO2e of CH4 per unit', 'kg CO2e of N2O per unit')
                    LIMIT 3
                )
                ELSE (
                    SELECT array_agg(ef."GHG Conversion Factor 2024" ORDER BY ef."GHG/Unit")
                    FROM emission_factors ef 
                    WHERE ( -- Consider more robust matching (e.g., tsvector, trigrams) or a mapping table
                        ef.category_1 ILIKE '%' || v_entry.category || '%' OR
                        ef.category_2 ILIKE '%' || v_entry.category || '%' OR
                        ef.category_3 ILIKE '%' || v_entry.category || '%' OR
                        ef.category_4 ILIKE '%' || v_entry.category || '%'
                    )
                    AND ef.uom ILIKE v_entry.unit -- Added Unit matching (assuming column `uom` exists)
                    AND ef.scope = 'Scope ' || v_entry.scope::text
                    AND ef."Source" = v_source
                    AND ef."GHG/Unit" IN ('kg CO2e of CO2 per unit', 'kg CO2e of CH4 per unit', 'kg CO2e of N2O per unit')
                    LIMIT 3
                )
            END 
        INTO v_factors_array;

        -- 4. Check if factors were found and calculate emissions
        IF v_factors_array IS NOT NULL AND array_length(v_factors_array, 1) = 3 THEN
            v_co2_factor := v_factors_array[1];
            v_ch4_factor := v_factors_array[2];
            v_n2o_factor := v_factors_array[3];

            v_co2_emissions := COALESCE(v_entry.quantity * v_co2_factor, 0);
            v_ch4_emissions := COALESCE(v_entry.quantity * v_ch4_factor, 0);
            v_n2o_emissions := COALESCE(v_entry.quantity * v_n2o_factor, 0);
            v_total_emissions := v_co2_emissions + v_ch4_emissions + v_n2o_emissions;
            
            v_status := 'matched';
        ELSE
            -- Factors not found or incomplete array
            v_status := 'factor_not_found';
            v_co2_factor := NULL;
            v_ch4_factor := NULL;
            v_n2o_factor := NULL;
            v_co2_emissions := 0; -- Or NULL based on preference
            v_ch4_emissions := 0;
            v_n2o_emissions := 0;
            v_total_emissions := 0;
        END IF;

    EXCEPTION
        WHEN others THEN
            RAISE WARNING 'Error calculating emissions for entry ID %: % - SQLSTATE: %', p_entry_id, SQLERRM, SQLSTATE;
            v_status := 'error';
            -- Set emissions to null/zero or leave as potentially partially calculated?
            v_co2_factor := NULL;
            v_ch4_factor := NULL;
            v_n2o_factor := NULL;
            v_co2_emissions := 0;
            v_ch4_emissions := 0;
            v_n2o_emissions := 0;
            v_total_emissions := 0;
    END;

    -- 5. Upsert into emission_calculations
    <<upsert_calculation>>
    INSERT INTO emission_calculations (
        entry_id,
        company_id,
        category, 
        unit,
        quantity,
        date,
        co2_factor,
        ch4_factor,
        n2o_factor,
        co2_emissions,
        ch4_emissions,
        n2o_emissions,
        total_emissions,
        source,
        status, -- Set the status
        calculated_at
    )
    VALUES (
        p_entry_id,
        v_entry.company_id,
        v_entry.category,
        v_entry.unit,
        v_entry.quantity,
        v_entry.date,
        v_co2_factor,
        v_ch4_factor,
        v_n2o_factor,
        v_co2_emissions,
        v_ch4_emissions,
        v_n2o_emissions,
        v_total_emissions,
        v_source, 
        v_status, -- Use the determined status
        now()
    )
    ON CONFLICT (entry_id) DO UPDATE SET
        category = EXCLUDED.category,
        unit = EXCLUDED.unit,
        quantity = EXCLUDED.quantity,
        date = EXCLUDED.date,
        co2_factor = EXCLUDED.co2_factor,
        ch4_factor = EXCLUDED.ch4_factor,
        n2o_factor = EXCLUDED.n2o_factor,
        co2_emissions = EXCLUDED.co2_emissions,
        ch4_emissions = EXCLUDED.ch4_emissions,
        n2o_emissions = EXCLUDED.n2o_emissions,
        total_emissions = EXCLUDED.total_emissions,
        source = EXCLUDED.source,
        status = EXCLUDED.status, -- Update status on conflict too
        calculated_at = EXCLUDED.calculated_at;

END;
$$; 
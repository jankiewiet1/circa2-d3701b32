-- Drop all existing functions and triggers
DROP TRIGGER IF EXISTS trg_calc_emissions ON public.emission_entries;
DROP FUNCTION IF EXISTS public.trg_after_emission_entry();
DROP FUNCTION IF EXISTS public.calculate_emissions_for_entry(entry_id bigint);
DROP FUNCTION IF EXISTS public.get_entries_without_calculations(integer, bigint);

-- Create the emissions calculation function
CREATE OR REPLACE FUNCTION public.calculate_emissions_for_entry(entry_id bigint)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_entry public.emission_entries;
    v_factor record;
    v_std_qty numeric;
    v_co2 numeric;
    v_ch4 numeric;
    v_n2o numeric;
BEGIN
    -- Get the emission entry
    SELECT * INTO v_entry FROM public.emission_entries WHERE id = entry_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Emission entry with ID % not found', entry_id;
    END IF;

    -- Get the emission factor
    SELECT 
        f.co2_factor as conversion_factor
    INTO v_factor
    FROM public.emission_factors f
    WHERE f.id = v_entry.emission_factor_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Emission factor with ID % not found', v_entry.emission_factor_id;
    END IF;

    -- Calculate standardized quantity
    v_std_qty := v_entry.quantity;

    -- Calculate emissions
    v_co2 := v_std_qty * v_factor.conversion_factor;
    v_ch4 := 0;
    v_n2o := 0;

    -- Insert or update emission calculations
    INSERT INTO public.emission_calculations (
        emission_entry_id,
        co2_emissions,
        ch4_emissions,
        n2o_emissions,
        created_at,
        updated_at
    ) VALUES (
        entry_id,
        v_co2,
        v_ch4,
        v_n2o,
        NOW(),
        NOW()
    )
    ON CONFLICT (emission_entry_id) DO UPDATE
    SET
        co2_emissions = EXCLUDED.co2_emissions,
        ch4_emissions = EXCLUDED.ch4_emissions,
        n2o_emissions = EXCLUDED.n2o_emissions,
        updated_at = NOW();
END;
$$;

-- Create trigger function
CREATE OR REPLACE FUNCTION public.trg_after_emission_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM public.calculate_emissions_for_entry(NEW.id);
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trg_calc_emissions
AFTER INSERT OR UPDATE ON public.emission_entries
FOR EACH ROW
EXECUTE FUNCTION public.trg_after_emission_entry();

-- Create pagination RPC function
CREATE OR REPLACE FUNCTION public.get_entries_without_calculations(
    batch_limit integer DEFAULT 50,
    cursor_id bigint DEFAULT NULL
)
RETURNS TABLE (
    id bigint
)
LANGUAGE sql
AS $$
    SELECT e.id
    FROM public.emission_entries e
    LEFT JOIN public.emission_calculations c ON c.emission_entry_id = e.id
    WHERE c.emission_entry_id IS NULL
    AND (cursor_id IS NULL OR e.id > cursor_id)
    ORDER BY e.id
    LIMIT batch_limit;
$$; 
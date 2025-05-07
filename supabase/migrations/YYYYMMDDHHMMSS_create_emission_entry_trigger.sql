-- Trigger function definition
CREATE OR REPLACE FUNCTION public.handle_new_emission_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Use definer if the trigger needs elevated privileges via the function it calls
AS $$
BEGIN
  -- Call the processing function for the newly inserted entry
  PERFORM public.process_single_emission_entry(NEW.id);
  RETURN NEW; -- Result is ignored since it's an AFTER trigger
END;
$$;

-- Drop existing trigger if it exists (optional, for idempotency)
DROP TRIGGER IF EXISTS trigger_emission_entry_insert ON public.emission_entries;

-- Trigger definition
CREATE TRIGGER trigger_emission_entry_insert
AFTER INSERT ON public.emission_entries
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_emission_entry(); 
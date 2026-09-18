/* =========================================================
   OLYMPIA 8-BIT · SUPABASE
   Conexión con la base de datos
   ========================================================= */

const SUPABASE_URL = "https://wbtwgojhgdayrifiwfxn.supabase.co";

const SUPABASE_KEY = "sb_publishable_27MkfTAFhUb8Uckfnxm3eg_XVgDgb58";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

window.OlympiaSupabase = supabaseClient;

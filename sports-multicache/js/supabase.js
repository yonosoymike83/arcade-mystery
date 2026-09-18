/* =========================================
   OLYMPIA 8-BIT
   SUPABASE
   ========================================= */

window.OlympiaSupabase = null;


/* =========================================
   COMPROBAR SUPABASE
   ========================================= */

if (
  window.supabase &&
  typeof window.supabase.createClient === "function"
) {

  const SUPABASE_URL =
    "https://wbtwgojhgdayrifiwfxn.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_27MkfTAFhUb8Uckfnxm3eg_XVgDgb58";


  window.OlympiaSupabase =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

}
else {

  console.warn(
    "Supabase no está disponible."
  );

}

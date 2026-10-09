(()=>{
const c=window.ELITE_CONFIG;
const client=window.supabase?.createClient;
if(!client||!c||!/^https:\/\/.+\.supabase\.co\/?$/.test(c.SUPABASE_URL)||c.SUPABASE_KEY.startsWith('PEGA_')){window.eliteDB=null;console.warn('Configura SUPABASE_URL y SUPABASE_KEY en config.js');return}
window.eliteDB=client(c.SUPABASE_URL,c.SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
})();

ELITE SPORT — SUPABASE
1. En Supabase > SQL Editor ejecuta supabase.sql.
2. En Authentication > Users crea un usuario administrador con email y contraseña (usa contraseña fuerte).
3. Ejecuta en SQL Editor: insert into public.admins(user_id) select id from auth.users where email='TU_CORREO_ADMIN@EJEMPLO.COM' on conflict do nothing;
4. En config.js pega tu Project URL y Publishable key (o anon key). NUNCA uses service_role ni secret key.
5. En config.js cambia el WhatsApp. La clave visual del panel es 111.
6. Abre index.html desde un servidor local (ej. VS Code Live Server), no file://. Publica en hosting HTTPS.
7. Los productos nuevos se comparten con todos los visitantes. Las fotos se guardan en Storage, bucket productos.
8. Las fotos antiguas guardadas en IndexedDB no se migran automáticamente: vuelve a publicarlas desde el panel.
9. Las políticas de la base de datos protegen las escrituras. El PIN 111 es solo una barrera visual, no seguridad real.
10. La actualización del catálogo ocurre al guardar, al cargar la página o al recargarla. No se usa Realtime.

-- Script para configurar CORS do bucket 'boxes'
-- Execute este SQL no SQL Editor do Supabase Dashboard

UPDATE storage.buckets 
SET cors_origins = array_append(cors_origins, 'https://guilimasp.github.io')
WHERE name = 'boxes';

-- Verificar se foi aplicado
SELECT name, cors_origins FROM storage.buckets WHERE name = 'boxes'; 
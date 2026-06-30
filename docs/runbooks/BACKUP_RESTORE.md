# Backup e restauração

O plano contratado do Supabase deve ser confirmado antes de alegar backup automático. Até lá, o responsável técnico deve executar export SQL e cópia dos objetos de `product-images` antes de mudanças de schema ou lote de mídia.

```bash
npx supabase db dump --linked --file backup/staging-schema.sql
npx supabase db dump --linked --data-only --file backup/staging-data.sql
```

Os arquivos de backup contêm dados sensíveis: criptografe, limite acesso e nunca versione. Trimestralmente, restaure em um projeto descartável de teste, valide contagens, pedidos, imagens e RLS, registre data/responsável e destrua o ambiente de teste com autorização.

# Bootstrap administrativo

Defina `ADMIN_BOOTSTRAP_EMAIL` com o e-mail do proprietário e execute uma única vez em ambiente autorizado:

```bash
npm run admin:bootstrap
```

O script cria ou convida o usuário sem senha hardcoded e atribui `owner`. Não há signup público. O proprietário deve concluir o convite, configurar senha forte e cadastrar TOTP antes de operar o painel. Revogue acessos antigos em Auth e em `admin_users`.

## Convite e recovery

- `NEXT_PUBLIC_SITE_URL` ou `VERCEL_URL` deve apontar para a origem atual antes de convidar um usuário novo.
- Convites são enviados com redirect para `/admin/definir-senha?flow=invite`.
- Recovery pode ser solicitado em `/admin/login` e retorna para `/admin/definir-senha?flow=recovery`.
- A tela exige sessão Supabase válida e senha com pelo menos 12 caracteres, maiúscula, minúscula, número e símbolo.
- Links inválidos ou expirados não exibem tokens e orientam a solicitar um novo link.
- Após convite, o owner segue para `/admin/mfa`; após recovery, segue para `/admin` e o próximo login continua aplicando o fluxo MFA existente.

No Supabase staging, configure em **Authentication > URL Configuration**:

- Site URL: `https://useart.vercel.app`;
- Redirect URLs: `https://useart-git-feat-commerce-pr-6b655e-matteo-lima-scottis-projects.vercel.app/**`;
- Redirect URLs de deploys imutáveis: `https://*-matteo-lima-scottis-projects.vercel.app/**`;
- desenvolvimento local: `http://localhost:3000/**` e `http://127.0.0.1:3000/**`.

Se o template de convite ou recovery foi personalizado, o link deve respeitar `{{ .RedirectTo }}`. O fallback `{{ .SiteURL }}` ignora o destino solicitado pela aplicação e pode levar o usuário para uma URL antiga. A rota `/auth/confirm` continua suportando templates baseados em `token_hash` e encaminha `invite` e `recovery` para a tela de senha.

O arquivo `supabase/config.toml` documenta a configuração esperada, mas esta mudança **não** deve ser aplicada ao staging com `supabase config push` sem revisar as demais opções do projeto. Atualize apenas Site URL e Redirect URLs pelo painel.

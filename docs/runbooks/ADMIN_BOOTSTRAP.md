# Bootstrap administrativo

Defina `ADMIN_BOOTSTRAP_EMAIL` com o e-mail do proprietário e execute uma única vez em ambiente autorizado:

```bash
npm run admin:bootstrap
```

O script cria ou convida o usuário sem senha hardcoded e atribui `owner`. Não há signup público. O proprietário deve concluir o convite, configurar senha forte e cadastrar TOTP antes de operar o painel. Revogue acessos antigos em Auth e em `admin_users`.

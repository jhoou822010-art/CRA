# Compras Rápidas

Loja afiliada responsiva em Next.js App Router, TypeScript, Tailwind e Supabase.

Para iniciantes, siga o [Guia completo de publicação](GUIA-PUBLICACAO.md), que explica a instalação, Supabase, GitHub, Vercel, domínio, backup e problemas comuns.

## Instalação em 3 comandos

```bash
npm install
npm run dev
npm run build
```

O comando `npm run lint` também está disponível para revisar o código.

## 1. Criar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor > New query**.
3. Cole e execute `supabase/schema.sql`.
4. Cole e execute `supabase/seed.sql` se quiser os produtos de exemplo.
5. Em **Authentication > Users**, crie o primeiro usuário.
6. Execute no SQL Editor, trocando o email:

```sql
update public.perfis set role='admin'
where id=(select id from auth.users where email='admin@seudominio.com');
```

## 2. Configurar o ambiente

Copie `.env.example` para `.env.local` e preencha:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL, em **Settings > API**.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave pública anon, em **Settings > API**.
- `SUPABASE_SERVICE_ROLE_KEY`: chave service_role, somente no servidor e usada pelo backup.
- `SUPABASE_DB_URL`: conexão PostgreSQL, somente para exportação avançada do banco.

Nunca coloque a service role em componentes com `"use client"` ou em variáveis `NEXT_PUBLIC_*`.

## 3. Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Rotas principais: `/`, `/produto/fone-bluetooth-wave-pro`, `/login`, `/cadastro`, `/conta` e `/admin`.

## 4. Publicar na Vercel

1. Envie o repositório para o GitHub.
2. Na Vercel, clique em **Add New Project** e importe o repositório.
3. O framework será detectado como Next.js. Não altere os comandos padrão.
4. Em **Settings > Environment Variables**, adicione as três variáveis Supabase. A `SUPABASE_SERVICE_ROLE_KEY` deve ficar disponível apenas no ambiente de servidor/backup.
5. Faça o deploy.

## 5. URLs do Auth e domínio

No Supabase, abra **Authentication > URL Configuration**:

- Site URL: `https://seu-dominio.vercel.app`.
- Redirect URLs: `https://seu-dominio.vercel.app/**` e `http://localhost:3000/**`.

Na Vercel, abra **Settings > Domains**, adicione seu domínio próprio e configure os registros DNS indicados. Depois substitua a Site URL do Supabase pelo domínio final HTTPS.

## Backup

Configure `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente e execute:

```bash
npm run backup
```

O script cria `backups/<data>/database.json` com os registros de perfis, categorias, produtos, pedidos e itens, além de `storage-index.json` com o índice dos arquivos do bucket `product-media`. Para backup completo dos binários, no Supabase Storage selecione os arquivos e baixe-os, ou sincronize o bucket por uma ferramenta S3 compatível. Nunca publique a service role.

Também existe o botão **Backup da loja > Baixar backup agora** na Área Admin. Ele exige um administrador autenticado e baixa um JSON com as tabelas e o índice do Storage. A chave `SUPABASE_SERVICE_ROLE_KEY` permanece somente no servidor.

## Problemas comuns e soluções

- **Missing Supabase environment variables**: confira `.env.local`, reinicie `npm run dev` e confirme URL/chave em Settings > API.
- **Usuário entra, mas não acessa `/admin`**: crie o usuário no Auth e execute o `update public.perfis` de administrador.
- **Imagens não aparecem**: confirme que o bucket `product-media` existe, que o SQL foi executado e que a URL é HTTPS.
- **Redirect URL inválida**: adicione exatamente o domínio HTTPS final e a URL local no Supabase Auth.
- **Build falha na Vercel**: confira todas as variáveis de ambiente nos três ambientes da Vercel e rode `npm run build` localmente.
- **Backup sem arquivos do Storage**: `storage-index.json` é um índice; baixe os binários pelo Storage ou sincronize o bucket separadamente.

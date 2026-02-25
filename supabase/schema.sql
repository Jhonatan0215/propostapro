-- ================================================
-- proposta-facil — Schema Supabase
-- Execute no SQL Editor do Supabase
-- ================================================

-- Tabela de empresas (1 por usuário)
create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nome text not null default '',
  cnpj text default '',
  telefone text default '',
  email text default '',
  endereco text default '',
  logo_url text default '',
  cor_primaria text default '#2563eb',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.empresas enable row level security;

create policy "Usuário vê sua própria empresa"
  on public.empresas for select using (auth.uid() = user_id);

create policy "Usuário cria sua empresa"
  on public.empresas for insert with check (auth.uid() = user_id);

create policy "Usuário atualiza sua empresa"
  on public.empresas for update using (auth.uid() = user_id);

-- Tabela de propostas
create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  cliente_nome text default '',
  cliente_email text default '',
  cliente_telefone text default '',
  observacoes text default '',
  validade_dias integer default 30,
  status text default 'pendente' check (status in ('pendente', 'aprovada', 'recusada')),
  valor_total numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.propostas enable row level security;

create policy "Usuário vê suas propostas"
  on public.propostas for select using (auth.uid() = user_id);

create policy "Usuário cria propostas"
  on public.propostas for insert with check (auth.uid() = user_id);

create policy "Usuário atualiza suas propostas"
  on public.propostas for update using (auth.uid() = user_id);

create policy "Usuário deleta suas propostas"
  on public.propostas for delete using (auth.uid() = user_id);

-- Tabela de itens da proposta
create table public.itens_proposta (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references public.propostas(id) on delete cascade not null,
  descricao text not null default '',
  quantidade numeric(10,2) default 1,
  valor_unit numeric(12,2) default 0,
  created_at timestamptz default now()
);

alter table public.itens_proposta enable row level security;

create policy "Usuário vê itens das suas propostas"
  on public.itens_proposta for select
  using (exists (
    select 1 from public.propostas p
    where p.id = proposta_id and p.user_id = auth.uid()
  ));

create policy "Usuário insere itens nas suas propostas"
  on public.itens_proposta for insert
  with check (exists (
    select 1 from public.propostas p
    where p.id = proposta_id and p.user_id = auth.uid()
  ));

create policy "Usuário deleta itens das suas propostas"
  on public.itens_proposta for delete
  using (exists (
    select 1 from public.propostas p
    where p.id = proposta_id and p.user_id = auth.uid()
  ));

-- Storage bucket para logos
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
  on conflict do nothing;

create policy "Usuário faz upload da própria logo"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Logo é pública"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Usuário atualiza sua logo"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

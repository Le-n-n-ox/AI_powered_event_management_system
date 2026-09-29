create table if not exists public.chat_messages (
    id bigint generated always as identity primary key,
    phone_number text not null,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamptz not null default now()
);

create index if not exists chat_messages_phone_created_at_idx
    on public.chat_messages (phone_number, created_at desc);

alter table public.chat_messages enable row level security;
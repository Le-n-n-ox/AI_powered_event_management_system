create table if not exists public.chat_messages (
    id bigint generated always as identity primary key,
    attendee_phone text not null,
    role text not null check (role in ('user', 'assistant')),
    message text not null,
    created_at timestamptz not null default now()
);

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'chat_messages'
          and column_name = 'phone_number'
    ) and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'chat_messages'
          and column_name = 'attendee_phone'
    ) then
        alter table public.chat_messages rename column phone_number to attendee_phone;
    end if;
end $$;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'chat_messages'
          and column_name = 'content'
    ) and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'chat_messages'
          and column_name = 'message'
    ) then
        alter table public.chat_messages rename column content to message;
    end if;
end $$;

create index if not exists chat_messages_phone_created_at_idx
    on public.chat_messages (attendee_phone, created_at desc);

alter table public.chat_messages enable row level security;
-- Home page slides: anyone can see them; the portal migration lets staff manage them.
begin;

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (length(image_url) <= 2000),
  title_ko text check (length(title_ko) <= 200),
  title_en text check (length(title_en) <= 200),
  subtitle_ko text check (length(subtitle_ko) <= 300),
  subtitle_en text check (length(subtitle_en) <= 300),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.hero_slides enable row level security;
revoke all on public.hero_slides from public, anon, authenticated;
grant select on public.hero_slides to anon, authenticated;
grant insert, update, delete on public.hero_slides to authenticated;
create policy read on public.hero_slides for select to anon, authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hero', 'hero', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

commit;

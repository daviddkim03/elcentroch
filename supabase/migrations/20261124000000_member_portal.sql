-- Member portal: accounts approved by the pastor, plus everything behind login.
-- Every table is closed by default: each grant and policy below is deliberate.
begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create type public.member_status as enum ('pending', 'active', 'declined', 'inactive');
create type public.member_role as enum ('pastor', 'admin', 'member');

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  status public.member_status not null default 'pending',
  role public.member_role not null default 'member',
  name_ko text not null check (length(btrim(name_ko)) between 1 and 80),
  name_en text check (length(name_en) <= 80),
  email text check (length(email) <= 200),
  phone text check (length(phone) <= 40),
  address text check (length(address) <= 300),
  birthday date,
  baptized_on date,
  church_title text check (length(church_title) <= 40),
  is_newcomer boolean not null default true,
  household_id uuid references public.households (id) on delete set null,
  group_id uuid,
  request_note text check (length(request_note) <= 1000),
  -- Directory consent: nothing is listed until the member turns it on.
  directory_listed boolean not null default false,
  directory_phone boolean not null default false,
  directory_email boolean not null default false,
  directory_address boolean not null default false,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.members (id) on delete set null
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name_ko text not null check (length(name_ko) between 1 and 80),
  name_en text check (length(name_en) <= 80),
  leader_id uuid references public.members (id) on delete set null,
  meeting text check (length(meeting) <= 200),
  location text check (length(location) <= 200),
  created_at timestamptz not null default now()
);
alter table public.members
  add foreign key (group_id) references public.groups (id) on delete set null;
create index on public.members (group_id);
create index on public.members (household_id);

create table public.group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  author_id uuid references public.members (id) on delete set null,
  author_name text not null default '',
  body text not null check (length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.group_posts (group_id, created_at desc);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'news' check (kind in ('news', 'bulletin')),
  title_ko text not null check (length(title_ko) between 1 and 200),
  title_en text check (length(title_en) <= 200),
  body_ko text check (length(body_ko) <= 10000),
  body_en text check (length(body_en) <= 10000),
  file_path text check (length(file_path) <= 300),
  pinned boolean not null default false,
  is_public boolean not null default false,
  published_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title_ko text not null check (length(title_ko) between 1 and 200),
  title_en text check (length(title_en) <= 200),
  details_ko text check (length(details_ko) <= 5000),
  details_en text check (length(details_en) <= 5000),
  location text check (length(location) <= 200),
  starts_at timestamptz not null,
  rsvp boolean not null default false,
  capacity int check (capacity > 0),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  member_name text not null default '',
  people int not null default 1 check (people between 1 and 20),
  note text check (length(note) <= 500),
  created_at timestamptz not null default now(),
  primary key (event_id, member_id)
);

create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  title_ko text not null check (length(title_ko) between 1 and 200),
  title_en text check (length(title_en) <= 200),
  scripture text check (length(scripture) <= 200),
  preacher text check (length(preacher) <= 80),
  preached_on date not null,
  youtube_id text check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  created_at timestamptz not null default now()
);

create table public.prayers (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.members (id) on delete cascade,
  author_name text not null default '',
  visibility text not null default 'church' check (visibility in ('pastor', 'group', 'church')),
  group_id uuid references public.groups (id) on delete cascade,
  body text not null check (length(btrim(body)) between 1 and 4000),
  answered boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.prayer_supports (
  prayer_id uuid not null references public.prayers (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  primary key (prayer_id, member_id)
);

create table public.serving_slots (
  id uuid primary key default gen_random_uuid(),
  team text not null check (length(team) between 1 and 80),
  serve_on date not null,
  member_id uuid references public.members (id) on delete set null,
  member_name text not null default '',
  status text not null default 'assigned' check (status in ('open', 'assigned', 'confirmed', 'swap')),
  created_at timestamptz not null default now()
);
create index on public.serving_slots (serve_on);

create table public.attendance (
  service_on date not null,
  member_id uuid not null references public.members (id) on delete cascade,
  primary key (service_on, member_id)
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 80),
  contact text not null check (length(btrim(contact)) between 3 and 200),
  message text check (length(message) <= 2000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Sensitive tables: no direct read by anyone; only the logged functions below.
create table public.care_notes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  kind text not null check (kind in ('visit', 'hospital', 'call', 'followup')),
  body text not null check (length(btrim(body)) between 1 and 5000),
  remind_on date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.members (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  birthday date,
  allergies text check (length(allergies) <= 500),
  notes text check (length(notes) <= 1000),
  pickup text check (length(pickup) <= 500),
  created_at timestamptz not null default now()
);
create index on public.children (guardian_id);

create table public.child_checkins (
  child_id uuid not null references public.children (id) on delete cascade,
  service_on date not null,
  code text not null,
  in_at timestamptz not null default now(),
  out_at timestamptz,
  picked_up_by text check (length(picked_up_by) <= 80),
  primary key (child_id, service_on)
);

create table public.giving (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete restrict,
  given_on date not null,
  amount numeric(12, 2) not null check (amount > 0),
  fund text not null default '헌금' check (length(fund) between 1 and 80),
  method text check (length(method) <= 40),
  created_at timestamptz not null default now()
);
create index on public.giving (member_id, given_on);

create table public.access_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_name text not null default '',
  action text not null,
  target text,
  at timestamptz not null default now()
);

-- ── Who is asking ───────────────────────────────────────────────────────────
-- security definer so policies can use them without recursing into RLS.

create function private.my_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.members where user_id = auth.uid() and status = 'active'
$$;
create function private.is_pastor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members
    where user_id = auth.uid() and status = 'active' and role = 'pastor')
$$;
create function private.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members
    where user_id = auth.uid() and status = 'active' and role in ('pastor', 'admin'))
$$;
create function private.my_group() returns uuid
language sql stable security definer set search_path = '' as $$
  select group_id from public.members where user_id = auth.uid() and status = 'active'
$$;
create function private.in_group(g uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select g is not null and (g = private.my_group() or exists (
    select 1 from public.groups where id = g and leader_id = private.my_id()))
$$;
create function private.leads(g uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.groups where id = g and leader_id = private.my_id())
$$;
create function private.is_guardian(g uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members me join public.members p
    on p.id = me.id or p.household_id = me.household_id
    where me.user_id = auth.uid() and me.status = 'active' and p.id = g)
$$;
create function private.my_child(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.children where id = c and private.is_guardian(guardian_id))
$$;
-- True for the SQL editor, migrations and Supabase Auth itself; never for an API request.
create function private.is_system() returns boolean
language sql stable set search_path = '' as $$
  select auth.uid() is null and session_user not in ('authenticator', 'anon', 'authenticated')
$$;
create function private.log(p_action text, p_target text) returns void
language sql security definer set search_path = '' as $$
  insert into public.access_log (actor_id, actor_name, action, target)
  select id, name_ko, p_action, p_target from public.members where user_id = auth.uid()
$$;
create function private.name_of(m uuid) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select name_ko from public.members where id = m), '')
$$;

-- ── Triggers ────────────────────────────────────────────────────────────────

-- Members edit their own contact details; church-managed fields are staff-only,
-- status and role are pastor-only, and the last pastor can't be removed.
create function private.guard_member() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_system() then
    if tg_op = 'INSERT' then
      if not private.is_pastor() and (new.role <> 'member' or new.status not in ('active', 'inactive')
          or new.user_id is not null) and coalesce(current_setting('portal.rpc', true), '') <> 'on' then
        raise exception 'not allowed' using errcode = '42501';
      end if;
    elsif coalesce(current_setting('portal.rpc', true), '') <> 'on' then
      if new.user_id is distinct from old.user_id or new.id <> old.id then
        raise exception 'not allowed' using errcode = '42501';
      end if;
      if not private.is_pastor() then
        if new.role <> old.role or new.status <> old.status
           or new.approved_at is distinct from old.approved_at
           or new.approved_by is distinct from old.approved_by
           or (old.role = 'pastor' and old.user_id is distinct from auth.uid()) then
          raise exception 'only the pastor can do this' using errcode = '42501';
        end if;
        if not private.is_staff() and (
             new.church_title is distinct from old.church_title
          or new.baptized_on is distinct from old.baptized_on
          or new.is_newcomer is distinct from old.is_newcomer
          or new.household_id is distinct from old.household_id
          or new.group_id is distinct from old.group_id
          or new.request_note is distinct from old.request_note
          or new.created_at <> old.created_at) then
          raise exception 'staff only' using errcode = '42501';
        end if;
      end if;
    end if;
  end if;
  if tg_op = 'UPDATE' then
    if old.status = 'pending' and new.status = 'active' then
      new.approved_at = now();
      new.approved_by = private.my_id();
    end if;
    if old.role = 'pastor' and old.status = 'active'
       and (new.role <> 'pastor' or new.status <> 'active')
       and not exists (select 1 from public.members
         where role = 'pastor' and status = 'active' and id <> old.id) then
      raise exception 'the church needs at least one pastor account' using errcode = '23514';
    end if;
  end if;
  return new;
end $$;
create trigger guard_member before insert or update on public.members
  for each row execute function private.guard_member();

create function private.log_member() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    perform private.log('member.delete', old.name_ko);
  elsif new.status <> old.status or new.role <> old.role then
    perform private.log('member.' || new.status || '.' || new.role, new.name_ko);
  end if;
  return null;
end $$;
create trigger log_member after update or delete on public.members
  for each row execute function private.log_member();

-- Author, name and group come from the session, so they can't be forged.
create function private.stamp_author() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_system() then new.author_id = private.my_id(); end if;
  new.author_name = private.name_of(new.author_id);
  new.created_at = now();
  return new;
end $$;
create trigger stamp before insert on public.group_posts
  for each row execute function private.stamp_author();
create trigger stamp before insert on public.prayers
  for each row execute function private.stamp_author();

create function private.prayer_group() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.visibility = 'group' then
    select group_id into new.group_id from public.members where id = new.author_id;
    if new.group_id is null then
      raise exception 'you are not in a group' using errcode = '23514';
    end if;
  else
    new.group_id = null;
  end if;
  return new;
end $$;
create trigger zz_group before insert on public.prayers
  for each row execute function private.prayer_group();

create function private.rsvp_check() returns trigger
language plpgsql security definer set search_path = '' as $$
declare e public.events;
begin
  -- The row lock makes two people racing for the last seat queue up.
  select * into e from public.events where id = new.event_id for update;
  if not e.rsvp or e.starts_at < now() then
    raise exception 'rsvp closed' using errcode = '23514';
  end if;
  if e.capacity is not null and new.people + coalesce((select sum(people) from public.event_rsvps
      where event_id = e.id and member_id <> new.member_id), 0) > e.capacity then
    raise exception 'event full' using errcode = '23514';
  end if;
  new.member_name = private.name_of(new.member_id);
  return new;
end $$;
create trigger rsvp_check before insert or update on public.event_rsvps
  for each row execute function private.rsvp_check();

create function private.slot_name() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.member_name = private.name_of(new.member_id);
  if new.member_id is null then new.status = 'open';
  elsif new.status = 'open' then new.status = 'assigned'; end if;
  return new;
end $$;
create trigger slot_name before insert or update on public.serving_slots
  for each row execute function private.slot_name();

create function private.log_giving() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.log('giving.' || lower(tg_op), private.name_of(coalesce(new.member_id, old.member_id)));
  return null;
end $$;
create trigger log_giving after insert or update or delete on public.giving
  for each row execute function private.log_giving();

-- ── Row-level security ──────────────────────────────────────────────────────

do $$ declare t text; begin
  foreach t in array array['households','members','groups','group_posts','announcements','events',
    'event_rsvps','sermons','prayers','prayer_supports','serving_slots','attendance','visits',
    'care_notes','children','child_checkins','giving','access_log'] loop
    execute format('alter table public.%I enable row level security', t);
    -- Supabase grants new tables to the API roles by default; start from nothing.
    execute format('revoke all on public.%I from public, anon, authenticated', t);
  end loop;
end $$;

-- Public content
grant select on public.announcements, public.events, public.sermons to anon, authenticated;
create policy read on public.announcements for select to anon, authenticated
  using (is_public or private.my_id() is not null);
create policy read on public.events for select to anon, authenticated
  using (is_public or private.my_id() is not null);
create policy read on public.sermons for select to anon, authenticated using (true);

-- Staff-managed tables
do $$ declare t text; begin
  foreach t in array array['households','groups','announcements','events','sermons',
    'serving_slots','attendance'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy staff on public.%I for all to authenticated
      using (private.is_staff()) with check (private.is_staff())', t);
  end loop;
end $$;
create policy read on public.serving_slots for select to authenticated
  using (private.my_id() is not null);
create policy read on public.groups for select to authenticated using (private.in_group(id));
create policy own on public.attendance for select to authenticated
  using (member_id = private.my_id());

-- Members: yourself, or staff. Everyone else goes through directory().
grant select, insert, update, delete on public.members to authenticated;
create policy read on public.members for select to authenticated
  using (user_id = auth.uid() or private.is_staff());
create policy add on public.members for insert to authenticated with check (private.is_staff());
create policy edit on public.members for update to authenticated
  using ((user_id = auth.uid() and status = 'active') or private.is_staff())
  with check ((user_id = auth.uid() and status = 'active') or private.is_staff());
create policy remove on public.members for delete to authenticated
  using (private.is_pastor() and user_id is distinct from auth.uid());

grant select, insert, delete on public.group_posts to authenticated;
create policy read on public.group_posts for select to authenticated using (private.in_group(group_id));
create policy add on public.group_posts for insert to authenticated
  with check (private.in_group(group_id) and author_id = private.my_id());
create policy remove on public.group_posts for delete to authenticated
  using (private.my_id() is not null and (author_id = private.my_id() or private.leads(group_id)));

grant select, insert, update, delete on public.event_rsvps to authenticated;
create policy own on public.event_rsvps for all to authenticated
  using (member_id = private.my_id()) with check (member_id = private.my_id());
create policy staff on public.event_rsvps for select to authenticated using (private.is_staff());

grant select, insert, delete on public.prayers to authenticated;
grant update (answered, body) on public.prayers to authenticated;
create policy read on public.prayers for select to authenticated
  using (private.my_id() is not null and (author_id = private.my_id() or private.is_pastor()
    or visibility = 'church' or (visibility = 'group' and private.in_group(group_id))));
create policy add on public.prayers for insert to authenticated with check (author_id = private.my_id());
create policy edit on public.prayers for update to authenticated
  using (author_id = private.my_id()) with check (author_id = private.my_id());
create policy remove on public.prayers for delete to authenticated
  using (author_id = private.my_id() or private.is_pastor());

-- The subquery applies the prayers policy, so support is only visible on visible prayers.
grant select, insert, delete on public.prayer_supports to authenticated;
create policy read on public.prayer_supports for select to authenticated
  using (exists (select 1 from public.prayers p where p.id = prayer_id));
create policy add on public.prayer_supports for insert to authenticated
  with check (member_id = private.my_id() and exists (select 1 from public.prayers p where p.id = prayer_id));
create policy remove on public.prayer_supports for delete to authenticated
  using (member_id = private.my_id());

grant select, update, delete on public.visits to authenticated;
create policy staff on public.visits for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

-- Parents manage their own children; staff read them only through checkin_roster().
grant select, insert, update, delete on public.children to authenticated;
create policy guardian on public.children for all to authenticated
  using (private.is_guardian(guardian_id)) with check (private.is_guardian(guardian_id));
grant select on public.child_checkins to authenticated;
create policy guardian on public.child_checkins for select to authenticated
  using (private.my_child(child_id));

-- Own giving; staff record through a write-only policy and read through giving_report().
grant select, insert on public.giving to authenticated;
create policy own on public.giving for select to authenticated using (member_id = private.my_id());
create policy add on public.giving for insert to authenticated with check (private.is_staff());

grant select on public.access_log to authenticated;
create policy pastor on public.access_log for select to authenticated using (private.is_pastor());

-- ── Functions the site calls ────────────────────────────────────────────────

create function public.apply_for_membership(p_name_ko text, p_name_en text, p_phone text, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'sign in first' using errcode = '42501'; end if;
  perform set_config('portal.rpc', 'on', true);
  insert into public.members (user_id, name_ko, name_en, phone, request_note, email)
  select auth.uid(), btrim(p_name_ko), nullif(btrim(p_name_en), ''), nullif(btrim(p_phone), ''),
         nullif(btrim(p_note), ''), u.email
  from auth.users u where u.id = auth.uid();
  perform set_config('portal.rpc', 'off', true);
end $$;

-- Approve a request; with p_existing, attach the account to a record the church already keeps.
create function public.approve_member(p_id uuid, p_existing uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.members;
begin
  if not private.is_pastor() then raise exception 'only the pastor can do this' using errcode = '42501'; end if;
  select * into r from public.members where id = p_id and status in ('pending', 'declined') for update;
  if not found then raise exception 'request not found' using errcode = 'P0002'; end if;
  if p_existing is null then
    update public.members set status = 'active' where id = p_id;
    if r.status = 'declined' then
      update public.members set approved_at = now(), approved_by = private.my_id() where id = p_id;
    end if;
  else
    perform set_config('portal.rpc', 'on', true);
    delete from public.members where id = p_id;
    update public.members set user_id = r.user_id, status = 'active',
      email = coalesce(email, r.email), phone = coalesce(phone, r.phone),
      name_en = coalesce(name_en, r.name_en), approved_at = now(), approved_by = private.my_id()
    where id = p_existing and user_id is null;
    if not found then raise exception 'that record already has an account' using errcode = '23505'; end if;
    perform set_config('portal.rpc', 'off', true);
    perform private.log('member.link', r.name_ko);
  end if;
end $$;

create function public.directory()
returns table (id uuid, name_ko text, name_en text, church_title text, phone text, email text,
  address text, group_ko text, group_en text)
language sql stable security definer set search_path = '' as $$
  select m.id, m.name_ko, m.name_en, m.church_title,
    case when m.directory_phone then m.phone end,
    case when m.directory_email then m.email end,
    case when m.directory_address then m.address end, g.name_ko, g.name_en
  from public.members m left join public.groups g on g.id = m.group_id
  where private.my_id() is not null and m.status = 'active' and m.directory_listed
  order by m.name_ko
$$;

-- Group roster: names for the group, phone numbers for its leader.
create function public.group_roster(p_group uuid)
returns table (id uuid, name_ko text, name_en text, phone text)
language sql stable security definer set search_path = '' as $$
  select m.id, m.name_ko, m.name_en,
    case when private.leads(p_group) or (m.directory_listed and m.directory_phone) then m.phone end
  from public.members m
  where private.in_group(p_group) and m.group_id = p_group and m.status = 'active'
  order by m.name_ko
$$;

create function public.event_counts()
returns table (event_id uuid, people bigint)
language sql stable security definer set search_path = '' as $$
  select r.event_id, sum(r.people) from public.event_rsvps r
  where private.my_id() is not null group by 1
$$;

create function public.serve_respond(p_slot uuid, p_action text)
returns void language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_id();
begin
  if me is null then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_action = 'confirm' then
    update public.serving_slots set status = 'confirmed' where id = p_slot and member_id = me;
  elsif p_action = 'swap' then
    update public.serving_slots set status = 'swap' where id = p_slot and member_id = me;
  elsif p_action = 'take' then
    update public.serving_slots set member_id = me, status = 'confirmed'
    where id = p_slot and status in ('open', 'swap') and member_id is distinct from me
      and serve_on >= current_date - 1;
  end if;
  if not found then raise exception 'slot unavailable' using errcode = 'P0002'; end if;
end $$;

-- The public visit form. Capped site-wide so a bot can't flood the pastor's list.
create function public.submit_visit(p_name text, p_contact text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.visits where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too many requests' using errcode = 'P0001';
  end if;
  insert into public.visits (name, contact, message) values (p_name, p_contact, nullif(btrim(p_message), ''));
end $$;

-- Pastoral care: pastor only, every read and write logged.
create function public.read_care_notes(p_member uuid) returns setof public.care_notes
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_pastor() then raise exception 'only the pastor can do this' using errcode = '42501'; end if;
  perform private.log('care.read', private.name_of(p_member));
  return query select * from public.care_notes where member_id = p_member order by created_at desc;
end $$;
create function public.add_care_note(p_member uuid, p_kind text, p_body text, p_remind date default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_pastor() then raise exception 'only the pastor can do this' using errcode = '42501'; end if;
  insert into public.care_notes (member_id, kind, body, remind_on) values (p_member, p_kind, p_body, p_remind);
  perform private.log('care.add', private.name_of(p_member));
end $$;
create function public.finish_care_note(p_id uuid, p_delete boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
declare m uuid;
begin
  if not private.is_pastor() then raise exception 'only the pastor can do this' using errcode = '42501'; end if;
  if p_delete then delete from public.care_notes where id = p_id returning member_id into m;
  else update public.care_notes set done = not done where id = p_id returning member_id into m; end if;
  perform private.log(case when p_delete then 'care.delete' else 'care.done' end, private.name_of(m));
end $$;

-- Dashboard lists. Reminders say who and when, never what the note says.
create function public.care_reminders()
returns table (id uuid, member_id uuid, name text, kind text, remind_on date)
language sql stable security definer set search_path = '' as $$
  select n.id, n.member_id, private.name_of(n.member_id), n.kind, n.remind_on
  from public.care_notes n
  where private.is_pastor() and not n.done and n.remind_on <= current_date + 7
  order by n.remind_on
$$;
-- Active people seen before, but at none of the last three recorded services.
create function public.absentees()
returns table (id uuid, name text, last_seen date)
language sql stable security definer set search_path = '' as $$
  with recent as (select distinct service_on from public.attendance order by 1 desc limit 3)
  select m.id, m.name_ko, max(a.service_on)
  from public.members m join public.attendance a on a.member_id = m.id
  where private.is_staff() and m.status = 'active' and (select count(*) from recent) = 3
  group by m.id, m.name_ko
  having max(a.service_on) < (select min(service_on) from recent)
  order by 3
$$;

create function public.checkin_roster(p_date date)
returns table (id uuid, name text, birthday date, allergies text, notes text, pickup text,
  guardian text, guardian_phone text, code text, in_at timestamptz, out_at timestamptz, picked_up_by text)
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_staff() then raise exception 'staff only' using errcode = '42501'; end if;
  perform private.log('children.read', p_date::text);
  return query select c.id, c.name, c.birthday, c.allergies, c.notes, c.pickup, g.name_ko, g.phone,
    k.code, k.in_at, k.out_at, k.picked_up_by
  from public.children c join public.members g on g.id = c.guardian_id and g.status = 'active'
  left join public.child_checkins k on k.child_id = c.id and k.service_on = p_date
  order by c.name;
end $$;
create function public.child_check_in(p_child uuid, p_date date) returns text
language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  if not private.is_staff() then raise exception 'staff only' using errcode = '42501'; end if;
  insert into public.child_checkins (child_id, service_on, code)
  values (p_child, p_date, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)))
  returning code into c;
  perform private.log('children.in', (select name from public.children where id = p_child));
  return c;
end $$;
create function public.child_check_out(p_child uuid, p_date date, p_code text, p_by text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_staff() then raise exception 'staff only' using errcode = '42501'; end if;
  if length(btrim(coalesce(p_by, ''))) = 0 then raise exception 'who picked up?' using errcode = '23514'; end if;
  update public.child_checkins set out_at = now(), picked_up_by = btrim(p_by)
  where child_id = p_child and service_on = p_date and out_at is null and code = upper(btrim(p_code));
  if not found then raise exception 'wrong pickup code' using errcode = 'P0002'; end if;
  perform private.log('children.out', (select name from public.children where id = p_child));
end $$;

create function public.giving_report(p_year int)
returns table (id uuid, member_id uuid, name text, given_on date, amount numeric, fund text, method text)
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_staff() then raise exception 'staff only' using errcode = '42501'; end if;
  perform private.log('giving.read', p_year::text);
  return query select g.id, g.member_id, private.name_of(g.member_id), g.given_on, g.amount, g.fund, g.method
  from public.giving g where extract(year from g.given_on) = p_year order by g.given_on desc, g.created_at desc;
end $$;
create function public.delete_giving(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_staff() then raise exception 'staff only' using errcode = '42501'; end if;
  delete from public.giving where id = p_id;
end $$;

-- Run once from the SQL editor to name the first pastor; not callable from the website.
create function private.make_pastor(p_email text, p_name_ko text) returns void
language plpgsql set search_path = '' as $$
declare u uuid;
begin
  select id into u from auth.users where lower(email) = lower(p_email) and email_confirmed_at is not null;
  if u is null then raise exception 'no confirmed account for %; sign up on the site first', p_email; end if;
  insert into public.members (user_id, name_ko, email, status, role, is_newcomer, approved_at)
  values (u, p_name_ko, p_email, 'active', 'pastor', false, now())
  on conflict (user_id) do update set status = 'active', role = 'pastor', is_newcomer = false;
end $$;

-- Functions are executable by everyone by default; hand them out one by one.
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.my_id(), private.is_pastor(), private.is_staff(), private.my_group(),
  private.in_group(uuid), private.leads(uuid), private.is_guardian(uuid), private.my_child(uuid)
  to anon, authenticated;
do $$ declare f text; begin
  foreach f in array array['apply_for_membership(text,text,text,text)','approve_member(uuid,uuid)',
    'directory()','group_roster(uuid)','event_counts()','serve_respond(uuid,text)',
    'submit_visit(text,text,text)','read_care_notes(uuid)','add_care_note(uuid,text,text,date)',
    'finish_care_note(uuid,boolean)','care_reminders()','absentees()','checkin_roster(date)',
    'child_check_in(uuid,date)','child_check_out(uuid,date,text,text)','giving_report(int)',
    'delete_giving(uuid)'] loop
    execute format('revoke execute on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
grant execute on function public.submit_visit(text, text, text) to anon;

-- ── Files and home slides ────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('church-files', 'church-files', false, 20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
create policy "church files: read" on storage.objects for select to authenticated
  using (bucket_id = 'church-files' and private.my_id() is not null);
create policy "church files: staff" on storage.objects for all to authenticated
  using (bucket_id = 'church-files' and private.is_staff())
  with check (bucket_id = 'church-files' and private.is_staff());
create policy "hero: staff" on storage.objects for all to authenticated
  using (bucket_id = 'hero' and private.is_staff())
  with check (bucket_id = 'hero' and private.is_staff());
create policy staff on public.hero_slides for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

notify pgrst, 'reload schema';
commit;

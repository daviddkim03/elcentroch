-- Super admins (the senior pastor and the site's developer) hold what only the pastor held:
-- approving people, roles, care notes and the access log. 'pastor' is now a regular pastor,
-- with the same access as 'admin'. Existing pastors become super admins.
begin;

alter type public.member_role rename value 'pastor' to 'superadmin';
alter type public.member_role add value 'pastor' before 'admin';

alter function private.is_pastor() rename to is_superadmin;

drop function private.make_pastor(text, text);

create or replace function private.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members
    where user_id = auth.uid() and status = 'active' and role <> 'member')
$$;

-- Policies follow the rename by themselves; function bodies are text and don't.
do $$ declare f record; begin
  for f in select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prokind = 'f'
      and (p.prosrc like '%is_pastor()%' or p.prosrc ~ 'role (=|<>) ''pastor''') loop
    execute replace(replace(replace(replace(replace(pg_get_functiondef(f.oid),
      'private.is_pastor()', 'private.is_superadmin()'),
      'role = ''pastor''', 'role = ''superadmin'''),
      'role <> ''pastor''', 'role <> ''superadmin'''),
      'only the pastor can do this', 'super admin only'),
      'at least one pastor account', 'at least one super admin');
  end loop;
end $$;

-- For the very first account, from the SQL editor. After that, roles are set in the portal.
create function private.make_superadmin(p_email text, p_name_ko text) returns void
language plpgsql set search_path = '' as $$
declare u uuid;
begin
  select id into u from auth.users where lower(email) = lower(p_email) and email_confirmed_at is not null;
  if u is null then raise exception 'no confirmed account for %; sign up on the site first', p_email; end if;
  insert into public.members (user_id, name_ko, email, status, role, is_newcomer, approved_at)
  values (u, p_name_ko, p_email, 'active', 'superadmin', false, now())
  on conflict (user_id) do update set status = 'active', role = 'superadmin', is_newcomer = false;
end $$;
revoke execute on function private.make_superadmin(text, text) from public, anon, authenticated;

notify pgrst, 'reload schema';
commit;

-- Run this whole file in Supabase > SQL Editor
create table profiles(
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role text not null default 'student' check (role in ('student','teacher')),
  created_at timestamptz default now());

create table projects(
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  title text not null, subject text not null, description text,
  deadline date not null,
  status text not null default 'not_started' check (status in ('not_started','pending','submitted','approved')),
  submitted_at timestamptz, note text, file_path text, file_name text,
  feedback text, grade text, feedback_path text, feedback_file text,
  created_at timestamptz default now());

create table notifications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text, title text not null, body text,
  read boolean default false, created_at timestamptz default now());

-- auto-create profile + welcome notification on sign up
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into profiles(id,full_name,role) values(new.id,
    coalesce(new.raw_user_meta_data->>'full_name','User'),
    case when new.raw_user_meta_data->>'role'='teacher' then 'teacher' else 'student' end);
  insert into notifications(user_id,type,title,body) values(new.id,'welcome','Welcome!','Thanks for using Student Project.');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_teacher() returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from profiles where id=auth.uid() and role='teacher') $$;

alter table profiles enable row level security;
alter table projects enable row level security;
alter table notifications enable row level security;

create policy "profiles read" on profiles for select to authenticated using (true);
create policy "profiles update own" on profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
revoke update on profiles from authenticated;
grant update (full_name) on profiles to authenticated;

create policy "student manages own" on projects for all to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());
create policy "teacher reads all" on projects for select to authenticated using (is_teacher());
create policy "teacher reviews" on projects for update to authenticated using (is_teacher());

create policy "notif read own" on notifications for select to authenticated using (user_id=auth.uid());
create policy "notif update own" on notifications for update to authenticated using (user_id=auth.uid());
create policy "notif insert" on notifications for insert to authenticated with check (true);

insert into storage.buckets(id,name,public) values('submissions','submissions',false) on conflict do nothing;
create policy "files upload" on storage.objects for insert to authenticated with check (bucket_id='submissions');
create policy "files read" on storage.objects for select to authenticated using (
  bucket_id='submissions' and (is_teacher() or (storage.foldername(name))[1]=auth.uid()::text or (storage.foldername(name))[1]='feedback'));

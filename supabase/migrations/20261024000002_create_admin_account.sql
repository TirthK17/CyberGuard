-- Create or update Admin User: tirthbariya03@gmail.com / TK@Diya#173

create extension if not exists "pgcrypto";

-- Update handle_new_user trigger function
create or replace function public.handle_new_user() returns trigger as $$
declare
  user_full_name text;
  assigned_role text;
begin
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  if user_full_name = '' then
    user_full_name := 'Defender';
  end if;

  if lower(new.email) in ('tirthbariya03@gmail.com', 'tirthbariya032@gmail.com', 'tirthk0717@gmail.com', 'admin@cyberguard.dev') then
    assigned_role := 'admin';
  else
    assigned_role := 'user';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    avatar_url,
    points,
    xp,
    level,
    tier,
    awareness_score,
    streak_days,
    status
  ) values (
    new.id,
    user_full_name,
    new.email,
    assigned_role,
    null,
    case when assigned_role = 'admin' then 2500 else 100 end,
    case when assigned_role = 'admin' then 2500 else 100 end,
    case when assigned_role = 'admin' then 5 else 1 end,
    case when assigned_role = 'admin' then 'Master Guardian' else 'Beginner' end,
    case when assigned_role = 'admin' then 100 else 0 end,
    1,
    'active'
  )
  on conflict (id) do update set
    role = excluded.role,
    email = excluded.email;

  return new;
end;
$$ language plpgsql security definer;

-- Insert or update user in auth.users
do $$
declare
  new_user_id uuid;
begin
  select id into new_user_id from auth.users where email = 'tirthbariya03@gmail.com';

  if new_user_id is null then
    new_user_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    ) values (
      new_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'tirthbariya03@gmail.com',
      crypt('TK@Diya#173', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Tirth Bariya"}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated',
      encode(gen_random_bytes(32), 'hex')
    );
  else
    update auth.users
    set encrypted_password = crypt('TK@Diya#173', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = new_user_id;
  end if;

  -- Ensure profile exists and has role 'admin'
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    avatar_url,
    points,
    xp,
    level,
    tier,
    awareness_score,
    streak_days,
    status
  ) values (
    new_user_id,
    'Tirth Bariya',
    'tirthbariya03@gmail.com',
    'admin',
    null,
    2500,
    2500,
    5,
    'Master Guardian',
    100,
    1,
    'active'
  )
  on conflict (id) do update set
    role = 'admin',
    full_name = 'Tirth Bariya',
    email = 'tirthbariya03@gmail.com',
    status = 'active';

end $$;

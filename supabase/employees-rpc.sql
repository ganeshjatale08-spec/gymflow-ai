-- RPC functions for employees (bypasses PostgREST cache issue)

create or replace function get_employees()
returns json language sql security definer as $$
  select coalesce(json_agg(row_to_json(e) order by e.created_at desc), '[]'::json)
  from employees e;
$$;

create or replace function insert_employee(payload json)
returns json language plpgsql security definer as $$
declare result json;
begin
  insert into employees (name, phone, email, role, status, salary, joining_date, address, emergency_contact, avatar_url, notes)
  values (
    payload->>'name', payload->>'phone', payload->>'email',
    coalesce(payload->>'role', 'Other'), coalesce(payload->>'status', 'active'),
    coalesce((payload->>'salary')::integer, 0),
    (payload->>'joining_date')::date,
    payload->>'address', payload->>'emergency_contact',
    payload->>'avatar_url', payload->>'notes'
  )
  returning row_to_json(employees.*) into result;
  return result;
end;
$$;

create or replace function update_employee(emp_id uuid, payload json)
returns json language plpgsql security definer as $$
declare result json;
begin
  update employees set
    name              = coalesce(payload->>'name', name),
    phone             = coalesce(payload->>'phone', phone),
    email             = payload->>'email',
    role              = coalesce(payload->>'role', role),
    status            = coalesce(payload->>'status', status),
    salary            = coalesce((payload->>'salary')::integer, salary),
    joining_date      = coalesce((payload->>'joining_date')::date, joining_date),
    address           = payload->>'address',
    emergency_contact = payload->>'emergency_contact',
    avatar_url        = payload->>'avatar_url',
    notes             = payload->>'notes',
    updated_at        = now()
  where id = emp_id
  returning row_to_json(employees.*) into result;
  return result;
end;
$$;

create or replace function delete_employee(emp_id uuid)
returns json language plpgsql security definer as $$
begin
  delete from employees where id = emp_id;
  return '{"success": true}'::json;
end;
$$;

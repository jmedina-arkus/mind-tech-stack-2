-- Habilitar RLS en las tablas
ALTER TABLE public.employees_2026_01_13_20_34 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts_2026_01_13_20_34 ENABLE ROW LEVEL SECURITY;

-- Políticas para empleados (solo usuarios autenticados pueden acceder)
CREATE POLICY "authenticated_users_can_view_employees" ON public.employees_2026_01_13_20_34
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_insert_employees" ON public.employees_2026_01_13_20_34
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_update_employees" ON public.employees_2026_01_13_20_34
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_delete_employees" ON public.employees_2026_01_13_20_34
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para prompts (solo usuarios autenticados pueden acceder)
CREATE POLICY "authenticated_users_can_view_prompts" ON public.prompts_2026_01_13_20_34
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_insert_prompts" ON public.prompts_2026_01_13_20_34
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_update_prompts" ON public.prompts_2026_01_13_20_34
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_delete_prompts" ON public.prompts_2026_01_13_20_34
  FOR DELETE USING (auth.role() = 'authenticated');
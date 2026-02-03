-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  total_employees INTEGER;
  total_prompts INTEGER;
  avg_processing_time NUMERIC;
  success_rate NUMERIC;
  result JSON;
BEGIN
  -- Contar empleados activos
  SELECT COUNT(*) INTO total_employees 
  FROM public.employees_2026_01_13_20_34 
  WHERE status = 'active';
  
  -- Contar prompts totales
  SELECT COUNT(*) INTO total_prompts 
  FROM public.prompts_2026_01_13_20_34;
  
  -- Calcular tiempo promedio de procesamiento
  SELECT AVG(processing_time_ms) INTO avg_processing_time 
  FROM public.prompts_2026_01_13_20_34;
  
  -- Calcular tasa de éxito (prompts completados)
  SELECT 
    (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*))
  INTO success_rate
  FROM public.prompts_2026_01_13_20_34;
  
  -- Construir resultado JSON
  result := json_build_object(
    'total_employees', total_employees,
    'total_prompts', total_prompts,
    'avg_processing_time_ms', COALESCE(avg_processing_time, 0),
    'success_rate', COALESCE(success_rate, 0)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener habilidades más solicitadas
CREATE OR REPLACE FUNCTION get_top_skills(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(skill_name TEXT, request_count BIGINT, percentage NUMERIC) AS $$
BEGIN
  RETURN QUERY
  WITH skill_mentions AS (
    SELECT 
      unnest(e.skills) as skill,
      COUNT(*) as mentions
    FROM public.employees_2026_01_13_20_34 e
    JOIN public.prompts_2026_01_13_20_34 p ON (
      p.request_content ILIKE '%' || ANY(e.skills) || '%'
    )
    GROUP BY unnest(e.skills)
  ),
  max_mentions AS (
    SELECT MAX(mentions) as max_count FROM skill_mentions
  )
  SELECT 
    sm.skill::TEXT,
    sm.mentions,
    ROUND((sm.mentions * 100.0 / mm.max_count), 0) as percentage
  FROM skill_mentions sm, max_mentions mm
  ORDER BY sm.mentions DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener empleados más sugeridos
CREATE OR REPLACE FUNCTION get_top_employees(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  employee_id UUID, 
  employee_name TEXT, 
  position TEXT, 
  suggestion_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH candidate_counts AS (
    SELECT 
      (jsonb_array_elements(returned_candidates)->>'id')::UUID as emp_id,
      COUNT(*) as suggestions
    FROM public.prompts_2026_01_13_20_34
    WHERE returned_candidates IS NOT NULL
    GROUP BY (jsonb_array_elements(returned_candidates)->>'id')::UUID
  )
  SELECT 
    e.id,
    e.name::TEXT,
    e.position::TEXT,
    cc.suggestions
  FROM candidate_counts cc
  JOIN public.employees_2026_01_13_20_34 e ON e.id = cc.emp_id
  ORDER BY cc.suggestions DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar empleados por habilidades
CREATE OR REPLACE FUNCTION search_employees_by_skills(search_skills TEXT[])
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  position TEXT,
  department TEXT,
  skills TEXT[],
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name::TEXT,
    e.email::TEXT,
    e.position::TEXT,
    e.department::TEXT,
    e.skills,
    -- Calcular score de coincidencia basado en habilidades
    (
      (SELECT COUNT(*) FROM unnest(e.skills) skill WHERE skill = ANY(search_skills)) * 100 / 
      GREATEST(array_length(search_skills, 1), 1)
    )::INTEGER as match_score
  FROM public.employees_2026_01_13_20_34 e
  WHERE e.skills && search_skills -- Operador de intersección de arrays
    AND e.status = 'active'
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
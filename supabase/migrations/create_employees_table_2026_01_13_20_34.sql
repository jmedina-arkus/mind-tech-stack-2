-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS public.employees_2026_01_13_20_34 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  position VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  skills TEXT[], -- Array de habilidades
  experience_years INTEGER DEFAULT 0,
  salary DECIMAL(10,2),
  hire_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active',
  phone VARCHAR(50),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de prompts/solicitudes
CREATE TABLE IF NOT EXISTS public.prompts_2026_01_13_20_34 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requester VARCHAR(255) NOT NULL,
  request_content TEXT NOT NULL,
  returned_candidates JSONB, -- Lista de candidatos devueltos
  status VARCHAR(50) DEFAULT 'completed',
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees_2026_01_13_20_34(name);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees_2026_01_13_20_34(department);
CREATE INDEX IF NOT EXISTS idx_employees_skills ON public.employees_2026_01_13_20_34 USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_prompts_timestamp ON public.prompts_2026_01_13_20_34(timestamp);
CREATE INDEX IF NOT EXISTS idx_prompts_requester ON public.prompts_2026_01_13_20_34(requester);

-- Insertar datos de ejemplo para empleados
INSERT INTO public.employees_2026_01_13_20_34 (name, email, position, department, skills, experience_years, salary, phone, location) VALUES
('Ana García', 'ana.garcia@company.com', 'Senior Developer', 'Desarrollo', ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript'], 5, 75000.00, '+34 600 123 456', 'Madrid'),
('Carlos Rodríguez', 'carlos.rodriguez@company.com', 'Full Stack Developer', 'Desarrollo', ARRAY['Python', 'Django', 'React', 'PostgreSQL'], 4, 68000.00, '+34 600 234 567', 'Barcelona'),
('María López', 'maria.lopez@company.com', 'Frontend Developer', 'Desarrollo', ARRAY['React', 'Vue.js', 'CSS', 'JavaScript'], 3, 55000.00, '+34 600 345 678', 'Valencia'),
('Juan Martínez', 'juan.martinez@company.com', 'Backend Developer', 'Desarrollo', ARRAY['Java', 'Spring', 'MySQL', 'Docker'], 6, 72000.00, '+34 600 456 789', 'Sevilla'),
('Laura Sánchez', 'laura.sanchez@company.com', 'DevOps Engineer', 'Infraestructura', ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform'], 4, 78000.00, '+34 600 567 890', 'Bilbao'),
('Pedro Jiménez', 'pedro.jimenez@company.com', 'UI/UX Designer', 'Diseño', ARRAY['Figma', 'Adobe XD', 'Sketch', 'Prototyping'], 3, 52000.00, '+34 600 678 901', 'Madrid'),
('Carmen Ruiz', 'carmen.ruiz@company.com', 'Data Scientist', 'Datos', ARRAY['Python', 'R', 'Machine Learning', 'SQL'], 5, 80000.00, '+34 600 789 012', 'Barcelona'),
('Miguel Torres', 'miguel.torres@company.com', 'Mobile Developer', 'Desarrollo', ARRAY['React Native', 'Swift', 'Kotlin', 'Flutter'], 4, 65000.00, '+34 600 890 123', 'Valencia');

-- Insertar datos de ejemplo para prompts
INSERT INTO public.prompts_2026_01_13_20_34 (requester, request_content, returned_candidates, processing_time_ms) VALUES
('HR Manager', 'Busco desarrollador React con experiencia en TypeScript', 
 '[{"id": "1", "name": "Ana García", "match_score": 95}, {"id": "3", "name": "María López", "match_score": 85}]'::jsonb, 
 1200),
('Project Manager', 'Necesito DevOps engineer con conocimientos en AWS', 
 '[{"id": "5", "name": "Laura Sánchez", "match_score": 98}]'::jsonb, 
 800),
('Tech Lead', 'Desarrollador Full Stack con Python y React', 
 '[{"id": "2", "name": "Carlos Rodríguez", "match_score": 92}, {"id": "7", "name": "Carmen Ruiz", "match_score": 75}]'::jsonb, 
 1500),
('HR Manager', 'Designer con experiencia en Figma y prototipado', 
 '[{"id": "6", "name": "Pedro Jiménez", "match_score": 90}]'::jsonb, 
 950),
('CTO', 'Desarrollador mobile con React Native y Flutter', 
 '[{"id": "8", "name": "Miguel Torres", "match_score": 88}]'::jsonb, 
 1100);
import { useState, useEffect } from 'react';
import { supabase } from "@/config/supabase";

// Tipos de datos
export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  skills: string[];
  experience_years: number;
  salary: number;
  hire_date: string;
  status: string;
  phone: string;
  location: string;
  created_at?: string;
  updated_at?: string;
}

export interface Prompt {
  id: string;
  timestamp: string;
  requester: string;
  request_content: string;
  returned_candidates: Array<{
    id: string;
    name: string;
    match_score: number;
  }>;
  status: string;
  processing_time_ms: number;
  created_at?: string;
}

// Mock data - Se usará cuando Supabase no esté disponible
const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana.garcia@company.com",
    position: "Senior Developer",
    department: "Desarrollo",
    skills: ["JavaScript", "React", "Node.js", "TypeScript"],
    experience_years: 5,
    salary: 75000,
    hire_date: "2019-03-15",
    status: "active",
    phone: "+34 600 123 456",
    location: "Madrid",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@company.com",
    position: "Full Stack Developer",
    department: "Desarrollo",
    skills: ["Python", "Django", "React", "PostgreSQL"],
    experience_years: 4,
    salary: 68000,
    hire_date: "2020-07-22",
    status: "active",
    phone: "+34 600 234 567",
    location: "Barcelona",
  },
  {
    id: "3",
    name: "María López",
    email: "maria.lopez@company.com",
    position: "Frontend Developer",
    department: "Desarrollo",
    skills: ["React", "Vue.js", "CSS", "JavaScript"],
    experience_years: 3,
    salary: 55000,
    hire_date: "2021-01-10",
    status: "active",
    phone: "+34 600 345 678",
    location: "Valencia",
  },
  {
    id: "4",
    name: "Juan Martínez",
    email: "juan.martinez@company.com",
    position: "Backend Developer",
    department: "Desarrollo",
    skills: ["Java", "Spring", "MySQL", "Docker"],
    experience_years: 6,
    salary: 72000,
    hire_date: "2018-09-12",
    status: "active",
    phone: "+34 600 456 789",
    location: "Sevilla",
  },
  {
    id: "5",
    name: "Laura Sánchez",
    email: "laura.sanchez@company.com",
    position: "DevOps Engineer",
    department: "Infraestructura",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    experience_years: 4,
    salary: 78000,
    hire_date: "2020-02-28",
    status: "active",
    phone: "+34 600 567 890",
    location: "Bilbao",
  },
  {
    id: "6",
    name: "Pedro Jiménez",
    email: "pedro.jimenez@company.com",
    position: "UI/UX Designer",
    department: "Diseño",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
    experience_years: 3,
    salary: 52000,
    hire_date: "2021-05-18",
    status: "active",
    phone: "+34 600 678 901",
    location: "Madrid",
  },
  {
    id: "7",
    name: "Carmen Ruiz",
    email: "carmen.ruiz@company.com",
    position: "Data Scientist",
    department: "Datos",
    skills: ["Python", "R", "Machine Learning", "SQL"],
    experience_years: 5,
    salary: 80000,
    hire_date: "2019-11-03",
    status: "active",
    phone: "+34 600 789 012",
    location: "Barcelona",
  },
  {
    id: "8",
    name: "Miguel Torres",
    email: "miguel.torres@company.com",
    position: "Mobile Developer",
    department: "Desarrollo",
    skills: ["React Native", "Swift", "Kotlin", "Flutter"],
    experience_years: 4,
    salary: 65000,
    hire_date: "2020-08-14",
    status: "active",
    phone: "+34 600 890 123",
    location: "Valencia",
  },
];

const mockPrompts: Prompt[] = [
  {
    id: "1",
    timestamp: "2024-01-13T10:30:00Z",
    requester: "HR Manager",
    request_content: "Busco desarrollador React con experiencia en TypeScript y al menos 3 años de experiencia",
    returned_candidates: [
      { id: "1", name: "Ana García", match_score: 95 },
      { id: "3", name: "María López", match_score: 85 },
    ],
    status: "completed",
    processing_time_ms: 1200,
  },
  {
    id: "2",
    timestamp: "2024-01-13T09:15:00Z",
    requester: "Project Manager",
    request_content: "Necesito DevOps engineer con conocimientos en AWS y Docker",
    returned_candidates: [
      { id: "5", name: "Laura Sánchez", match_score: 98 },
    ],
    status: "completed",
    processing_time_ms: 800,
  },
  {
    id: "3",
    timestamp: "2024-01-13T08:45:00Z",
    requester: "Tech Lead",
    request_content: "Desarrollador Full Stack con Python y experiencia en bases de datos",
    returned_candidates: [
      { id: "2", name: "Carlos Rodríguez", match_score: 92 },
      { id: "7", name: "Carmen Ruiz", match_score: 85 },
    ],
    status: "completed",
    processing_time_ms: 1500,
  },
  {
    id: "4",
    timestamp: "2024-01-12T16:20:00Z",
    requester: "HR Manager",
    request_content: "Designer con experiencia en Figma y prototipado, conocimientos de UX/UI",
    returned_candidates: [
      { id: "6", name: "Pedro Jiménez", match_score: 90 },
    ],
    status: "completed",
    processing_time_ms: 950,
  },
  {
    id: "5",
    timestamp: "2024-01-12T14:10:00Z",
    requester: "CTO",
    request_content: "Desarrollador mobile con React Native y Flutter, experiencia en publicación de apps",
    returned_candidates: [
      { id: "8", name: "Miguel Torres", match_score: 88 },
    ],
    status: "completed",
    processing_time_ms: 1100,
  },
];

// Hook para gestión de empleados
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar empleados
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees_2026_01_13_20_34')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setEmployees(data as Employee[]);
        setError(null);
      } else {
        setEmployees(mockEmployees);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar empleados desde Supabase');
      setEmployees(mockEmployees);
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar empleado
  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // TODO: Reemplazar con llamada a Supabase
      // const { data, error } = await supabase
      //   .from('employees_2026_01_13_20_34')
      //   .insert([employeeData])
      //   .select()
      //   .single();

      // if (error) throw error;

      // Por ahora simular con datos mock
      const newEmployee: Employee = {
        ...employeeData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setEmployees(prev => [newEmployee, ...prev]);
      return { success: true, data: newEmployee };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al agregar empleado' };
    }
  };

  // Función para actualizar empleado
  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      // TODO: Reemplazar con llamada a Supabase
      // const { data, error } = await supabase
      //   .from('employees_2026_01_13_20_34')
      //   .update({ ...updates, updated_at: new Date().toISOString() })
      //   .eq('id', id)
      //   .select()
      //   .single();

      // if (error) throw error;

      // Por ahora simular con datos mock
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === id
            ? { ...emp, ...updates, updated_at: new Date().toISOString() }
            : emp
        )
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar empleado' };
    }
  };

  // Función para eliminar empleado
  const deleteEmployee = async (id: string) => {
    try {
      // TODO: Reemplazar con llamada a Supabase
      // const { error } = await supabase
      //   .from('employees_2026_01_13_20_34')
      //   .delete()
      //   .eq('id', id);

      // if (error) throw error;

      // Por ahora simular con datos mock
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar empleado' };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

// Hook para gestión de prompts
export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar prompts
  const fetchPrompts = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con llamada a Supabase cuando esté conectado
      // const { data, error } = await supabase
      //   .from('prompts_2026_01_13_20_34')
      //   .select('*')
      //   .order('timestamp', { ascending: false });

      // if (error) throw error;
      // setPrompts(data || []);

      // Por ahora usar datos mock
      await new Promise(resolve => setTimeout(resolve, 500));
      setPrompts(mockPrompts);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar prompts');
      setPrompts(mockPrompts); // Fallback a datos mock
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar prompt
  const addPrompt = async (promptData: Omit<Prompt, 'id' | 'timestamp' | 'created_at'>) => {
    try {
      // TODO: Reemplazar con llamada a Supabase
      const newPrompt: Prompt = {
        ...promptData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      setPrompts(prev => [newPrompt, ...prev]);
      return { success: true, data: newPrompt };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al agregar prompt' };
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  return {
    prompts,
    loading,
    error,
    fetchPrompts,
    addPrompt,
  };
}

// Hook para estadísticas del dashboard
export function useDashboardStats() {
  const { employees } = useEmployees();
  const { prompts } = usePrompts();

  const stats = {
    totalEmployees: employees.filter(emp => emp.status === 'active').length,
    totalRequests: prompts.length,
    avgResponseTime: prompts.length > 0
      ? `${(prompts.reduce((acc, p) => acc + p.processing_time_ms, 0) / prompts.length / 1000).toFixed(1)}s`
      : "0s",
    successRate: prompts.length > 0
      ? `${((prompts.filter(p => p.status === 'completed').length / prompts.length) * 100).toFixed(1)}%`
      : "0%",
  };

  // Calcular habilidades más solicitadas
  const skillCounts: { [key: string]: number } = {};
  prompts.forEach(prompt => {
    const content = prompt.request_content.toLowerCase();
    employees.forEach(emp => {
      emp.skills.forEach(skill => {
        if (content.includes(skill.toLowerCase())) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      });
    });
  });

  const maxCount = Math.max(...Object.values(skillCounts), 1);
  const topSkills = Object.entries(skillCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / maxCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Calcular empleados más sugeridos
  const employeeSuggestions: { [key: string]: number } = {};
  prompts.forEach(prompt => {
    prompt.returned_candidates.forEach(candidate => {
      employeeSuggestions[candidate.id] = (employeeSuggestions[candidate.id] || 0) + 1;
    });
  });

  const topEmployees = Object.entries(employeeSuggestions)
    .map(([id, suggestions]) => {
      const employee = employees.find(emp => emp.id === id);
      return employee ? {
        id,
        name: employee.name,
        position: employee.position,
        suggestions,
      } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b?.suggestions || 0) - (a?.suggestions || 0))
    .slice(0, 5);

  return {
    stats,
    topSkills,
    topEmployees,
  };
}
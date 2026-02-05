import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";


export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  seniority?: string;
  skills: string[];
  experience_years: number;
  location: string;
}

export interface Candidate {
  id: string;
  name: string;
  match_score: number;
}

export type PromptStatus = "completed" | "processing" | "failed";

export interface Prompt {
  id: string;
  timestamp: string;
  requester: string;
  request_content: string;
  returned_candidates: Candidate[];
  status: PromptStatus;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name", { ascending: true });
      if (error) {
        console.error(error);
        setError("Error al cargar empleados");
      } else {
        setEmployees(data as Employee[]);
      }
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  return { employees, loading, error };
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("timestamp", { ascending: false });
      if (error) {
        console.error(error);
        setError("Error al cargar prompts");
      } else {
        setPrompts(data as Prompt[]);
      }
      setLoading(false);
    };
    fetchPrompts();
  }, []);

  return { prompts, loading, error };
}

export function useDashboardStats() {
  const { employees } = useEmployees();
  const { prompts } = usePrompts();

  const stats = {
    totalEmployees: employees.length,
    totalRequests: prompts.length,
    avgResponseTime: "1.2s",
    successRate: "100%",
  };

  const topSkills = [
    { name: "JavaScript", count: employees.filter(e => e.skills.includes("JavaScript")).length, percentage: 0 },
    { name: "React", count: employees.filter(e => e.skills.includes("React")).length, percentage: 0 },
  ].map(skill => ({
    ...skill,
    percentage: employees.length > 0 ? Math.round((skill.count / employees.length) * 100) : 0,
  }));

  const topEmployees = employees
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      name: e.name,
      position: e.position,
      suggestions: prompts.filter(p =>
        p.returned_candidates.some(c => c.id === e.id)
      ).length,
    }));

  return { stats, topSkills, topEmployees };
}

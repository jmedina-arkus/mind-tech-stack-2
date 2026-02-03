import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalRequests: 0,
    avgResponseTime: "—",
    successRate: "—",
  });

  const [topSkills, setTopSkills] = useState<any[]>([]);
  const [topEmployees, setTopEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        /* TOTAL EMPLOYEES */
        const { count: employeeCount, error: empError } = await supabase
          .from("employees")
          .select("*", { count: "exact", head: true });

        if (empError) throw empError;

        /* TOTAL REQUESTS */
        const { count: requestCount, error: reqError } = await supabase
          .from("requests")
          .select("*", { count: "exact", head: true });

        if (reqError) throw reqError;

        /* TOP SKILLS */
        const { data: skillsData, error: skillsError } = await supabase
          .from("employee_skills")
          .select("skill");

        if (skillsError) throw skillsError;

        const skillMap: Record<string, number> = {};
        skillsData?.forEach((s: any) => {
          skillMap[s.skill] = (skillMap[s.skill] || 0) + 1;
        });

        const skillsArray = Object.entries(skillMap).map(
          ([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / skillsData!.length) * 100),
          })
        );

        /* TOP EMPLOYEES */
        const { data: employees, error: empListError } = await supabase
          .from("employees")
          .select("id, name, position, suggestion_count")
          .order("suggestion_count", { ascending: false })
          .limit(5);

        if (empListError) throw empListError;

        setStats({
          totalEmployees: employeeCount || 0,
          totalRequests: requestCount || 0,
          avgResponseTime: "1.2s",
          successRate: "98%",
        });

        setTopSkills(skillsArray);
        setTopEmployees(
          employees?.map((e: any) => ({
            id: e.id,
            name: e.name,
            position: e.position,
            suggestions: e.suggestion_count,
          })) || []
        );
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return {
    stats,
    topSkills,
    topEmployees,
    loading,
    error,
  };
};

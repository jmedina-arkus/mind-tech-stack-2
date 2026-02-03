import { Layout } from "@/components/layout/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TopSkills } from "@/components/dashboard/TopSkills";
import { TopEmployees } from "@/components/dashboard/TopEmployees";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Users, MessageSquare } from "lucide-react";

const WorkingIndex = () => {
  const { stats, topSkills, topEmployees, loading, error } =
    useDashboardStats();

  // ✅ Fecha calculada correctamente (NO como string en JSX)
  const lastUpdate = new Date().toLocaleString("es-ES");

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-10 gap-2 text-muted-foreground">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          Cargando dashboard...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10 text-destructive">
          {typeof error === "string"
            ? error
            : "Error cargando dashboard"}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Resumen de actividad y métricas del sistema
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Última actualización: {lastUpdate}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Total Empleados"
            value={stats.totalEmployees}
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            title="Solicitudes Totales"
            value={stats.totalRequests}
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSkills skills={topSkills} />
          <TopEmployees employees={topEmployees} />
        </div>
      </div>
    </Layout>
  );
};

export default WorkingIndex;

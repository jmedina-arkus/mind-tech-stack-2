import { Layout } from "@/components/layout/Layout";

const SimpleIndex = () => {
  console.log("SimpleIndex component rendering");
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mb-6">
          Resumen de actividad y métricas del sistema
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Total Empleados</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Solicitudes Totales</h3>
            <p className="text-2xl font-bold">5</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Tiempo Promedio</h3>
            <p className="text-2xl font-bold">1.2s</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-muted-foreground">Tasa de Éxito</h3>
            <p className="text-2xl font-bold">100%</p>
          </div>
        </div>
        
        <div className="mt-8 bg-card p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estado del Sistema</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Sistema funcionando correctamente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Base de datos conectada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Usando datos de ejemplo</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimpleIndex;
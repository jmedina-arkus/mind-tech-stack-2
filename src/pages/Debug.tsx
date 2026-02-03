import { useEffect } from "react";

const Debug = () => {
  useEffect(() => {
    console.log("Debug component mounted");
    console.log("Location:", window.location.href);
    console.log("Auth status:", localStorage.getItem("isAuthenticated"));
    
    // Verificar si hay errores en los hooks
    try {
      console.log("Testing imports...");
    } catch (error) {
      console.error("Error in Debug component:", error);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Debug Mode</h1>
        <p className="text-muted-foreground mb-4">
          Verificando el estado de la aplicación...
        </p>
        <div className="text-left space-y-2">
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>Auth:</strong> {localStorage.getItem("isAuthenticated") || "No auth"}</p>
          <p><strong>User:</strong> {localStorage.getItem("user") || "No user"}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Recargar Página
        </button>
      </div>
    </div>
  );
};

export default Debug;
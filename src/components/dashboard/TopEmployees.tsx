import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Employee {
  id: string;
  name: string;
  position: string;
  suggestions: number;
  avatar?: string;
}

interface TopEmployeesProps {
  employees: Employee[];
}

export function TopEmployees({ employees }: TopEmployeesProps) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Empleados Más Sugeridos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {employees.map((employee, index) => (
              <div key={employee.id} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback className="text-xs">
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {employee.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {employee.position}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {employee.suggestions} sugerencias
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
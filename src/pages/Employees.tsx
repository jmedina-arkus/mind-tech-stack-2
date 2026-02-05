import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, Download, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  seniority?: string;
  skills: string[];
  experience_years: number;
  location: string;
  last_project: string;
  resume_url: string;
}

const Employees = () => {
  const { toast } = useToast();
  const { employees, addEmployee, deleteEmployee, updateEmployee } =
    useEmployees();

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<
    | "name"
    | "email"
    | "position"
    | "seniority"
    | "skills"
    | "experience_years"
    | "location"
    | "last_project"
    | "resume_url"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* 🔑 FORM STATE */
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [skillsText, setSkillsText] = useState(""); // ✅ estado visual
  const [editData, setEditData] = useState<Partial<Employee>>({});
  const [editSkillsText, setEditSkillsText] = useState("");

  /* =========================
     FILTER
  ========================= */

  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    setFilteredEmployees(
      employees.filter(
        (e) =>
          (e.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.position ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (e.skills ?? []).some((s) =>
            s.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    );
  }, [employees, searchTerm]);

  /* =========================
     HELPERS
  ========================= */

  const parseSkills = (text: string): string[] =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const normalizeUrlForHref = (value?: string) => {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const parseCSV = (text: string) => {
    const rows: string[][] = [];
    let current = "";
    let row: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (next === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
        continue;
      }

      if (char === ",") {
        row.push(current);
        current = "";
        continue;
      }

      if (char === "\n") {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
        continue;
      }

      if (char === "\r") {
        continue;
      }

      current += char;
    }

    if (current.length > 0 || row.length > 0) {
      row.push(current);
      rows.push(row);
    }

    const headers = (rows.shift() ?? []).map((h) => h.trim());
    return { headers, rows };
  };

  const handleChange = (field: keyof Employee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field: keyof Employee, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSort = (
    key:
      | "name"
      | "email"
      | "position"
      | "seniority"
      | "skills"
      | "experience_years"
      | "location"
      | "last_project"
      | "resume_url"
  ) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const getSortValue = (employee: Employee, key: typeof sortKey) => {
    if (key === "experience_years") return employee.experience_years || 0;
    if (key === "skills") return (employee.skills ?? []).join(", ");
    return (employee[key] ?? "") as string;
  };

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aValue = getSortValue(a, sortKey);
    const bValue = getSortValue(b, sortKey);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const sortLabel = (key: typeof sortKey) =>
    sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : "";

  /* =========================
     ADD
  ========================= */

  const handleAdd = async () => {
    const skillsArray = parseSkills(skillsText);

    if (!formData.name || !formData.email || !formData.position) {
      toast({
        title: "Campos requeridos",
        description: "Nombre, email y posición",
        variant: "destructive",
      });
      return;
    }

    await addEmployee({
      name: formData.name,
      email: formData.email,
      position: formData.position,
      seniority: formData.seniority || "",
      experience_years: formData.experience_years || 0,
      location: formData.location || "",
      last_project: formData.last_project || "",
      resume_url: formData.resume_url || "",
      skills: skillsArray, // ✅ ARRAY LIMPIO
    });

    toast({ title: "Empleado creado" });

    setFormData({});
    setSkillsText("");
    setIsAddOpen(false);
  };

  const openEdit = (employee: Employee) => {
    setEditData(employee);
    setEditSkillsText((employee.skills ?? []).join(", "));
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    const skillsArray = parseSkills(editSkillsText);

    if (!editData.id) return;

    if (!editData.name || !editData.email || !editData.position) {
      toast({
        title: "Campos requeridos",
        description: "Nombre, email y posición",
        variant: "destructive",
      });
      return;
    }

    await updateEmployee(editData.id, {
      name: editData.name,
      email: editData.email,
      position: editData.position,
      seniority: editData.seniority || "",
      experience_years: editData.experience_years || 0,
      location: editData.location || "",
      last_project: editData.last_project || "",
      resume_url: editData.resume_url || "",
      skills: skillsArray,
    });

    toast({ title: "Empleado actualizado" });

    setIsEditOpen(false);
    setEditData({});
    setEditSkillsText("");
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Eliminar a ${emp.name}?`)) return;
    await deleteEmployee(emp.id);
  };

  const handleUploadCSV = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const { headers, rows } = parseCSV(text);
    const headerIndex = headers.reduce<Record<string, number>>(
      (acc, header, index) => {
        acc[header.toLowerCase()] = index;
        return acc;
      },
      {}
    );

    const getValue = (row: string[], key: string) => {
      const index = headerIndex[key];
      if (index === undefined) return "";
      return row[index] ?? "";
    };

    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      const name = getValue(row, "name").trim();
      const email = getValue(row, "email").trim();
      const position = getValue(row, "position").trim();

      if (!name || !email || !position) {
        skipped += 1;
        continue;
      }

      const skills = parseSkills(getValue(row, "skills"));
      const experienceYears = Number(
        getValue(row, "experience_years") || 0
      );

      await addEmployee({
        name,
        email,
        position,
        seniority: getValue(row, "seniority") || "",
        experience_years: Number.isFinite(experienceYears)
          ? experienceYears
          : 0,
        location: getValue(row, "location") || "",
        last_project: getValue(row, "last_project") || "",
        resume_url: getValue(row, "resume_url") || "",
        skills,
      });
      created += 1;
    }

    toast({
      title: "CSV procesado",
      description: `Creados: ${created}, omitidos: ${skipped}`,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadCSV = () => {
    const headers = [
      "name",
      "email",
      "position",
      "seniority",
      "experience_years",
      "skills",
      "location",
      "last_project",
      "resume_url",
    ];

    const escapeValue = (value: string | number) => {
      const text = String(value ?? "");
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows = sortedEmployees.map((e) => [
      e.name,
      e.email,
      e.position,
      e.seniority,
      e.experience_years,
      (e.skills ?? []).join(", "),
      e.location,
      e.last_project,
      e.resume_url,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employees.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  /* =========================
     UI
  ========================= */

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Empleados</h1>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUploadCSV}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar empleado
                </Button>
              </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Los campos marcados con * son obligatorios.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employee-name">Nombre *</Label>
                  <Input
                    id="employee-name"
                    placeholder="Nombre completo"
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-email">Email *</Label>
                  <Input
                    id="employee-email"
                    placeholder="email@company.com"
                    value={formData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-position">Posición *</Label>
                  <Input
                    id="employee-position"
                    placeholder="Cargo o posición"
                    value={formData.position || ""}
                    onChange={(e) => handleChange("position", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-seniority">Seniority</Label>
                  <Input
                    id="employee-seniority"
                    placeholder="Junior, Mid, Senior"
                    value={formData.seniority || ""}
                    onChange={(e) => handleChange("seniority", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="employee-skills">Habilidades</Label>
                  <Textarea
                    id="employee-skills"
                    placeholder="JavaScript, React, Node.js (separadas por comas)"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-experience">
                    Años de Experiencia
                  </Label>
                  <Input
                    id="employee-experience"
                    placeholder="0"
                    type="number"
                    value={formData.experience_years || 0}
                    onChange={(e) =>
                      handleChange("experience_years", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-location">Ubicación</Label>
                  <Input
                    id="employee-location"
                    placeholder="Ciudad, País"
                    value={formData.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-last-project">Proyecto actual</Label>
                  <Input
                    id="employee-last-project"
                    placeholder="Nombre del proyecto"
                    value={formData.last_project || ""}
                    onChange={(e) =>
                      handleChange("last_project", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="employee-resume-url">Resume URL</Label>
                  <Input
                    id="employee-resume-url"
                    placeholder="URL del CV"
                    value={formData.resume_url || ""}
                    onChange={(e) => handleChange("resume_url", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdd}>Agregar empleado</Button>
              </div>
            </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Empleado</DialogTitle>
                  <DialogDescription>
                    Actualiza los datos del empleado seleccionado.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-employee-name">Nombre *</Label>
                    <Input
                      id="edit-employee-name"
                      placeholder="Nombre completo"
                      value={editData.name || ""}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-employee-email">Email *</Label>
                    <Input
                      id="edit-employee-email"
                      placeholder="email@company.com"
                      value={editData.email || ""}
                      onChange={(e) =>
                        handleEditChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-employee-position">Posición *</Label>
                    <Input
                      id="edit-employee-position"
                      placeholder="Cargo o posición"
                      value={editData.position || ""}
                      onChange={(e) =>
                        handleEditChange("position", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-employee-seniority">Seniority</Label>
                    <Input
                      id="edit-employee-seniority"
                      placeholder="Junior, Mid, Senior"
                      value={editData.seniority || ""}
                      onChange={(e) =>
                        handleEditChange("seniority", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-employee-skills">Habilidades</Label>
                    <Textarea
                      id="edit-employee-skills"
                      placeholder="JavaScript, React, Node.js (separadas por comas)"
                      value={editSkillsText}
                      onChange={(e) => setEditSkillsText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-employee-experience">
                      Años de Experiencia
                    </Label>
                    <Input
                      id="edit-employee-experience"
                      placeholder="0"
                      type="number"
                      value={editData.experience_years || 0}
                      onChange={(e) =>
                        handleEditChange(
                          "experience_years",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-employee-location">Ubicación</Label>
                    <Input
                      id="edit-employee-location"
                      placeholder="Ciudad, País"
                      value={editData.location || ""}
                      onChange={(e) =>
                        handleEditChange("location", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-employee-last-project">
                      Proyecto actual
                    </Label>
                    <Input
                      id="edit-employee-last-project"
                      placeholder="Nombre del proyecto"
                      value={editData.last_project || ""}
                      onChange={(e) =>
                        handleEditChange("last_project", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-employee-resume-url">Resume URL</Label>
                    <Input
                      id="edit-employee-resume-url"
                      placeholder="URL del CV"
                      value={editData.resume_url || ""}
                      onChange={(e) =>
                        handleEditChange("resume_url", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEdit}>Guardar cambios</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Card>
          <CardHeader>
            <CardTitle>Empleados ({filteredEmployees.length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[1200px] text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center py-4 px-4 min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                    >
                      Nombre{sortLabel("name")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[220px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("email")}
                    >
                      Correo{sortLabel("email")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[160px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("position")}
                    >
                      Posición{sortLabel("position")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("seniority")}
                    >
                      Seniority{sortLabel("seniority")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("skills")}
                    >
                      Skills{sortLabel("skills")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("experience_years")}
                    >
                      Experiencia{sortLabel("experience_years")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[180px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("location")}
                    >
                      Ubicación{sortLabel("location")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("last_project")}
                    >
                      Proyecto{sortLabel("last_project")}
                    </button>
                  </TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[120px]">Resume</TableHead>
                  <TableHead className="text-center py-4 px-4 min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedEmployees.map((e) => (
                  <TableRow key={e.id} className="align-top">
                    <TableCell className="text-center py-4 px-4">{e.name}</TableCell>
                    <TableCell className="text-center py-4 px-4">{e.email}</TableCell>
                    <TableCell className="text-center py-4 px-4 whitespace-normal">{e.position}</TableCell>
                    <TableCell className="text-center py-4 px-4">{e.seniority}</TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex flex-wrap justify-center gap-1">
                        {(e.skills ?? []).slice(0, 3).map((s) => (
                          <Badge key={s}>{s}</Badge>
                        ))}
                        {(e.skills ?? []).length > 3 && (
                          <Badge
                            variant="outline"
                            title={(e.skills ?? []).slice(3).join(", ")}
                          >
                            +{(e.skills ?? []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4 px-4">
                      {e.experience_years} años
                    </TableCell>
                    <TableCell className="text-center py-4 px-4 whitespace-normal">
                      {e.location}
                    </TableCell>
                    <TableCell className="text-center py-4 px-4 whitespace-normal">
                      {e.last_project}
                    </TableCell>
                    <TableCell className="text-center py-4 px-4">
                      {e.resume_url ? (
                        <a
                          href={normalizeUrlForHref(e.resume_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          Ver
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 py-4 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Employees;

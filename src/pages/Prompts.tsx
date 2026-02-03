import { supabase } from "@/config/supabase";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Download, Trash2, Upload } from "lucide-react";
import type { Prompt } from "@/hooks/useDataSimple";

/* ======================================================
   COMPONENT
====================================================== */

const Prompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [requesterFilter, setRequesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ======================================================
     FETCH FROM SUPABASE
  ====================================================== */

  const normalizeCandidates = (raw: unknown) => {
    let candidates = raw;

    if (typeof candidates === "string") {
      try {
        candidates = JSON.parse(candidates);
      } catch {
        return [
          {
            id: candidates,
            name: candidates,
            match_score: 0,
          },
        ];
      }
    }

    if (!Array.isArray(candidates)) {
      if (candidates && typeof candidates === "object") {
        const obj = candidates as Record<string, unknown>;
        const nested =
          obj.candidates ?? obj.returned_candidates ?? obj.data ?? obj.items;
        if (Array.isArray(nested)) {
          candidates = nested;
        } else {
          return [];
        }
      } else {
        return [];
      }
    }

    return (candidates as Array<unknown>).map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `${item}-${index}`,
          name: item,
          match_score: 0,
        };
      }

      const c = item as Record<string, unknown>;
      const name = String(c.name ?? c.full_name ?? c.candidate ?? "");
      const matchScoreRaw = c.match_score ?? c.matchScore ?? c.score ?? 0;
      const matchScore = Number(matchScoreRaw);

      return {
        id: String(
          c.id ?? c.candidate_id ?? c.employee_id ?? name ?? index
        ),
        name: name || `Candidato ${index + 1}`,
        match_score: Number.isFinite(matchScore) ? matchScore : 0,
      };
    });
  };

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
      setLoading(false);
      return;
    }

    const normalized = (data ?? []).map((p: any) => {
      const candidatesSource =
        p.returned_candidates ??
        p.candidatos ??
        p.candidates ??
        p.returnedCandidates ??
        p.output ??
        p.result ??
        p.response ??
        p.response_candidates;

      return {
        ...p,
        returned_candidates: normalizeCandidates(candidatesSource),
        status:
          p.status === "completed" ||
            p.status === "processing" ||
            p.status === "failed"
            ? p.status
            : "processing",
      };
    });

    setPrompts(normalized as Prompt[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  /* ======================================================
     FILTERING
  ====================================================== */

  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.request_content.toLowerCase().includes(q) ||
          p.requester.toLowerCase().includes(q) ||
          p.returned_candidates.some((c) =>
            c.name.toLowerCase().includes(q)
          )
      );
    }

    if (requesterFilter !== "all") {
      result = result.filter((p) => p.requester === requesterFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [prompts, searchTerm, requesterFilter, statusFilter]);

  /* ======================================================
     HELPERS
  ====================================================== */

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
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

  const parseCandidates = (value: string) => {
    if (!value.trim()) return [];
    return value
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item, index) => {
        const match = item.match(/^(.*?)(?:\s*\((\d+)%\))?$/);
        const name = match?.[1]?.trim() || item;
        const score = match?.[2] ? Number(match[2]) : 0;
        return {
          id: `${name}-${index}`,
          name,
          match_score: Number.isFinite(score) ? score : 0,
        };
      });
  };

  const exportToCSV = () => {
    const headers = [
      "Fecha",
      "Solicitante",
      "Contenido",
      "Candidatos",
      "Estado",
    ];

    const rows = filteredPrompts.map((p) => [
      formatDate(p.timestamp),
      p.requester,
      `"${p.request_content.replace(/"/g, '""')}"`,
      p.returned_candidates
        .map((c) => `${c.name} (${c.match_score}%)`)
        .join("; "),
      p.status,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "prompts_auditoria.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const requesters = Array.from(new Set(prompts.map((p) => p.requester)));

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

    const inserts = rows
      .map((row) => {
        const timestamp =
          getValue(row, "timestamp") || getValue(row, "fecha");
        const requester =
          getValue(row, "requester") || getValue(row, "solicitante");
        const requestContent =
          getValue(row, "request_content") || getValue(row, "contenido");
        const candidatesRaw =
          getValue(row, "returned_candidates") || getValue(row, "candidatos");
        const status = getValue(row, "status") || getValue(row, "estado");

        if (!requester || !requestContent) return null;

        const payload: Record<string, unknown> = {
          requester,
          request_content: requestContent,
          returned_candidates: parseCandidates(candidatesRaw),
        };

        if (status) payload.status = status;
        if (timestamp) payload.timestamp = timestamp;

        return payload;
      })
      .filter(Boolean) as Record<string, unknown>[];

    if (inserts.length === 0) {
      setError("No se encontraron filas válidas en el CSV");
      return;
    }

    const { error: insertError } = await supabase
      .from("prompts")
      .insert(inserts);

    if (insertError) {
      console.error(insertError);
      setError("Error al subir CSV");
      return;
    }

    await fetchPrompts();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (prompt: Prompt) => {
    if (!confirm("Eliminar este prompt?")) return;

    const { error: deleteError } = await supabase
      .from("prompts")
      .delete()
      .eq("id", prompt.id);

    if (deleteError) {
      console.error(deleteError);
      setError("Error al eliminar prompt");
      return;
    }

    await fetchPrompts();
  };

  /* ======================================================
     UI
  ====================================================== */

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 text-muted-foreground">
          Cargando prompts…
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10 text-destructive">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Prompts</h1>
            <p className="text-muted-foreground mt-1">
              Historial de solicitudes al agente IA
            </p>
          </div>

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
            <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompts ({filteredPrompts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Candidatos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.timestamp)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.requester}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {p.request_content}
                    </TableCell>
                    <TableCell>
                      {p.returned_candidates.map((c) => (
                        <Badge
                          key={c.id}
                          className={`mr-1 ${getMatchScoreColor(
                            c.match_score
                          )}`}
                        >
                          {c.name}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Prompts;

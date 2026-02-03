import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

/* =======================
   TIPOS / INTERFACES
======================= */

interface DashboardStats {
    totalEmployees: number;
    totalRequests: number;
    avgResponseTime: string;
    successRate: string;
}

interface TopSkill {
    name: string;
    count: number;
    percentage: number;
}

interface TopEmployee {
    id: string;
    name: string;
    position: string;
    suggestions: number;
}

interface UseDashboardStatsReturn {
    stats: DashboardStats;
    topSkills: TopSkill[];
    topEmployees: TopEmployee[];
    loading: boolean;
    error: string | null;
}

/* =======================
   HOOK
======================= */

export const useDashboardStats = (): UseDashboardStatsReturn => {
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        totalRequests: 0,
        avgResponseTime: "—",
        successRate: "—",
    });

    const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
    const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                /* 1️⃣ TOTAL EMPLOYEES */
                const { count: employeeCount, error: empError } = await supabase
                    .from("employees")
                    .select("*", { count: "exact", head: true });

                if (empError) throw empError;

                /* 2️⃣ TOTAL REQUESTS */
                const { count: requestCount, error: reqError } = await supabase
                    .from("prompts")
                    .select("*", { count: "exact", head: true });

                if (reqError) throw reqError;

                /* 3️⃣ TOP SKILLS (from top_skills table) */
                const { data: skillsData, error: skillsError } = await supabase
                    .from("top_skills")
                    .select("skill");

                if (skillsError) throw skillsError;

                const skillMap: Record<string, number> = {};
                const originalSkillNameByKey: Record<string, string> = {};

                const normalizeSkillValue = (value: unknown): string[] => {
                    if (value == null) return [];
                    if (Array.isArray(value)) {
                        return value.flatMap((v) => normalizeSkillValue(v));
                    }
                    if (typeof value === "string") {
                        const trimmed = value.trim();
                        if (!trimmed) return [];
                        if (
                            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
                            (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
                            (trimmed.startsWith("\"") && trimmed.endsWith("\""))
                        ) {
                            try {
                                return normalizeSkillValue(JSON.parse(trimmed));
                            } catch {
                                return [trimmed.replace(/^"+|"+$/g, "")];
                            }
                        }
                        return [trimmed];
                    }
                    if (typeof value === "object") {
                        const obj = value as Record<string, unknown>;
                        if ("skill" in obj) return normalizeSkillValue(obj.skill);
                        if ("name" in obj) return normalizeSkillValue(obj.name);
                    }
                    return [];
                };

                (skillsData ?? []).forEach((row: any) => {
                    const names = normalizeSkillValue(row.skill);
                    names.forEach((name) => {
                        const rawName = String(name || "").trim();
                        if (!rawName) return;
                        const key = rawName.toLowerCase();
                        if (!key) return;
                        skillMap[key] = (skillMap[key] || 0) + 1;
                        if (!originalSkillNameByKey[key]) {
                            originalSkillNameByKey[key] = rawName;
                        }
                    });
                });

                const skillsArray: TopSkill[] = Object.entries(skillMap).map(
                    ([key, count]) => ({
                        name: originalSkillNameByKey[key] ?? key,
                        count,
                        percentage: 0,
                    })
                );

                const maxCount = skillsArray.reduce(
                    (acc, s) => Math.max(acc, s.count),
                    0
                );

                skillsArray.forEach((s) => {
                    s.percentage =
                        maxCount > 0 ? Math.round((s.count * 100) / maxCount) : 0;
                });

                skillsArray.sort((a, b) => b.count - a.count);

                /* 4️⃣ TOP EMPLOYEES */
                const { data: promptsData, error: promptsError } = await supabase
                    .from("prompts")
                    .select("returned_candidates");

                if (promptsError) throw promptsError;

                const normalizeCandidates = (raw: unknown) => {
                    let candidates = raw;

                    if (typeof candidates === "string") {
                        try {
                            candidates = JSON.parse(candidates);
                        } catch {
                            return [{ name: candidates }];
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

                    return (candidates as Array<unknown>).map((item) => {
                        if (typeof item === "string") {
                            return { name: item };
                        }

                        const c = item as Record<string, unknown>;
                        return {
                            id: typeof c.id === "string" ? c.id : undefined,
                            name:
                                typeof c.name === "string"
                                    ? c.name
                                    : typeof c.full_name === "string"
                                        ? c.full_name
                                        : undefined,
                        };
                    });
                };

                const normalizeName = (name: string) =>
                    name.trim().toLowerCase();

                const suggestionById: Record<string, number> = {};
                const suggestionByName: Record<string, number> = {};
                const nameById: Record<string, string> = {};
                const originalNameByKey: Record<string, string> = {};

                (promptsData ?? []).forEach((p: { returned_candidates: unknown }) => {
                    const candidates = normalizeCandidates(p.returned_candidates);
                    candidates.forEach((c) => {
                        if (c.id) {
                            suggestionById[c.id] = (suggestionById[c.id] || 0) + 1;
                            if (c.name) {
                                nameById[c.id] = c.name;
                            }
                            return;
                        }

                        if (c.name) {
                            const key = normalizeName(c.name);
                            suggestionByName[key] = (suggestionByName[key] || 0) + 1;
                            if (!originalNameByKey[key]) {
                                originalNameByKey[key] = c.name;
                            }
                        }
                    });
                });

                const { data: employees, error: empListError } = await supabase
                    .from("employees")
                    .select("id, name, position");

                if (empListError) throw empListError;

                setStats({
                    totalEmployees: employeeCount ?? 0,
                    totalRequests: requestCount ?? 0,
                    avgResponseTime: "1.2s",
                    successRate: "98%",
                });

                setTopSkills(skillsArray);

                const matchedNameKeys = new Set<string>();

                const employeesWithSuggestions = (employees ?? []).map((e) => {
                    const nameKey = normalizeName(e.name);
                    const suggestions =
                        suggestionById[e.id] ?? suggestionByName[nameKey] ?? 0;
                    if (suggestions > 0) {
                        matchedNameKeys.add(nameKey);
                    }
                    return {
                        id: e.id,
                        name: e.name,
                        position: e.position || "Sin puesto",
                        suggestions,
                    };
                });

                const unmatchedByName = Object.entries(suggestionByName)
                    .filter(([key, count]) => count > 0 && !matchedNameKeys.has(key))
                    .map(([key, count]) => ({
                        id: `name:${key}`,
                        name: originalNameByKey[key] ?? key,
                        position: "Sin puesto",
                        suggestions: count,
                    }));

                const unmatchedById = Object.entries(suggestionById)
                    .filter(([id, count]) => {
                        if (count <= 0) return false;
                        return !(employees ?? []).some((e) => e.id === id);
                    })
                    .map(([id, count]) => ({
                        id,
                        name: nameById[id] ?? id,
                        position: "Sin puesto",
                        suggestions: count,
                    }));

                setTopEmployees(
                    [...employeesWithSuggestions, ...unmatchedByName, ...unmatchedById]
                        .filter((e) => e.suggestions > 0)
                        .sort((a, b) => b.suggestions - a.suggestions)
                        .slice(0, 5)
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

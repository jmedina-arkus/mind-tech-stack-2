import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

export interface Employee {
    id: string;
    name: string;
    email: string;
    position: string;
    seniority?: string;
    experience_years: number;
    location: string;
    last_project: string;
    resume_url: string;
    skills: string[];
}

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const EMPLOYEES_TABLE = "employees";

    const normalizeSkills = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.filter(Boolean);
        if (typeof value === "string") {
            return value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        }
        return [];
    };

    /* =========================
       FETCH
    ========================= */

    const fetchEmployees = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from(EMPLOYEES_TABLE)
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            const normalized = data.map((e: any) => ({
                ...e,
                skills: normalizeSkills(e.skills),
            }));

            setEmployees(normalized);
        } else if (error) {
            console.error("Error fetching employees", error);
        }

        setLoading(false);
    };

    /* =========================
       ADD
    ========================= */

    const addEmployee = async (employee: Omit<Employee, "id">) => {
        const skills = normalizeSkills(employee.skills);
        const { data, error } = await supabase
            .from(EMPLOYEES_TABLE)
            .insert({
                name: employee.name,
                email: employee.email,
                position: employee.position,
                seniority: employee.seniority,
                experience_years: employee.experience_years,
                location: employee.location,
                last_project: employee.last_project,
                resume_url: employee.resume_url,
                skills,
            })
            .select("id")
            .single();

        if (error || !data) {
            console.error(
                "Error inserting employee",
                error?.code,
                error?.message,
                error?.details,
                error?.hint,
                error
            );
            return;
        }

        let employeeId = data?.id;
        if (!employeeId && employee.email) {
            const { data: employeeRow, error: lookupError } = await supabase
                .from(EMPLOYEES_TABLE)
                .select("id")
                .eq("email", employee.email)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (lookupError) {
                console.error("Error looking up employee id", lookupError);
            } else {
                employeeId = employeeRow?.id;
            }
        }

        if (skills.length > 0) {
            if (!employeeId) {
                console.error("Missing employee id for skills insert");
            } else {
            const skillRows = skills.map((skill) => ({
                employee_id: employeeId,
                skill,
            }));
            const { error: skillsError } = await supabase
                .from("employee_skills")
                .insert(skillRows);

            if (skillsError) {
                console.error("Error inserting employee skills", skillsError);
            }
            }
        }

        fetchEmployees();
    };

    /* =========================
       UPDATE
    ========================= */

    const updateEmployee = async (id: string, employee: Partial<Employee>) => {
        await supabase
            .from(EMPLOYEES_TABLE)
            .update({
                name: employee.name,
                email: employee.email,
                position: employee.position,
                seniority: employee.seniority,
                experience_years: employee.experience_years,
                location: employee.location,
                last_project: employee.last_project,
                resume_url: employee.resume_url,
                skills: normalizeSkills(employee.skills),
            })
            .eq("id", id);

        fetchEmployees();
    };

    /* =========================
       DELETE
    ========================= */

    const deleteEmployee = async (id: string) => {
        await supabase.from(EMPLOYEES_TABLE).delete().eq("id", id);
        fetchEmployees();
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    return {
        employees,
        loading,
        addEmployee,
        updateEmployee,
        deleteEmployee,
    };
}

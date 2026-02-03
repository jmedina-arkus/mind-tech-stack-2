// src/config/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Usa tus variables de entorno reales
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Crea el cliente
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

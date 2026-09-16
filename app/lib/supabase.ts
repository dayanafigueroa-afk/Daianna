import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          correo: string;
          cargo: string;
          permiso: string;
          rol: string;
          area: string;
          activo: boolean;
          created_at: string;
        };
      };
      edificios: {
        Row: {
          id: number;
          nombre: string;
          comuna: string;
          tipo: string;
          modelo: string;
          deptos: number;
          propietario: string;
          jem_correo: string;
          jop_correo: string;
        };
      };
      categorias: {
        Row: {
          id: number;
          rol: string;
          categoria: string;
          subcategoria: string;
          dias: number | null;
          horas: number;
          prioridad: string;
          activo: boolean;
        };
      };
      tickets: {
        Row: {
          id: string;
          folio: string;
          asunto: string;
          descripcion: string;
          edificio_id: number;
          area_solicitante: string;
          categoria_id: number;
          prioridad: string;
          responsable_correo: string;
          solicitante_correo: string;
          estado: string;
          created_at: string;
          due_at: string;
          resolved_at: string | null;
          csat: number | null;
        };
      };
      ticket_historial: {
        Row: {
          id: string;
          ticket_id: string;
          autor_correo: string;
          tipo: string;
          accion: string;
          texto: string;
          created_at: string;
        };
      };
      adjuntos: {
        Row: {
          id: string;
          ticket_id: string;
          historial_id: string | null;
          nombre: string;
          url: string;
          created_at: string;
        };
      };
    };
  };
};

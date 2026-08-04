// Este arquivo pode ser regenerado depois com `supabase gen types typescript` para ficar em sincronia com o banco.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      app_members: Table<
        { email: string; nome: string | null; created_at: string },
        { email: string; nome?: string | null; created_at?: string },
        { email?: string; nome?: string | null; created_at?: string }
      >;
      contatos: Table<
        { id: string; nome: string; tel: string | null; origem: string | null; obs: string | null; created_at: string },
        { id?: string; nome: string; tel?: string | null; origem?: string | null; obs?: string | null; created_at?: string },
        { id?: string; nome?: string; tel?: string | null; origem?: string | null; obs?: string | null; created_at?: string }
      >;
      turmas: Table<
        { id: string; nome: string; dia: number | null; hora: string | null },
        { id?: string; nome: string; dia?: number | null; hora?: string | null },
        { id?: string; nome?: string; dia?: number | null; hora?: string | null }
      >;
      matriculas: Table<
        { id: string; contato_id: string; turma_id: string | null; mensalidade: number | null; pagamento: string | null; status: string; created_at: string },
        { id?: string; contato_id: string; turma_id?: string | null; mensalidade?: number | null; pagamento?: string | null; status?: string; created_at?: string },
        { id?: string; contato_id?: string; turma_id?: string | null; mensalidade?: number | null; pagamento?: string | null; status?: string; created_at?: string }
      >;
      workshops: Table<
        { id: string; nome: string; datas: string | null; preco: string | null; created_at: string },
        { id?: string; nome: string; datas?: string | null; preco?: string | null; created_at?: string },
        { id?: string; nome?: string; datas?: string | null; preco?: string | null; created_at?: string }
      >;
      inscricoes: Table<
        { id: string; contato_id: string; workshop_id: string; status: string | null },
        { id?: string; contato_id: string; workshop_id: string; status?: string | null },
        { id?: string; contato_id?: string; workshop_id?: string; status?: string | null }
      >;
      avulsas: Table<
        { id: string; contato_id: string; turma_id: string | null; data: string | null; status: string | null },
        { id?: string; contato_id: string; turma_id?: string | null; data?: string | null; status?: string | null },
        { id?: string; contato_id?: string; turma_id?: string | null; data?: string | null; status?: string | null }
      >;
      pecas: Table<
        { id: string; contato_id: string; descricao: string | null; data_deixou: string | null; estimativa: string | null; data_pronta: string | null; status: string; created_at: string },
        { id?: string; contato_id: string; descricao?: string | null; data_deixou?: string | null; estimativa?: string | null; data_pronta?: string | null; status?: string; created_at?: string },
        { id?: string; contato_id?: string; descricao?: string | null; data_deixou?: string | null; estimativa?: string | null; data_pronta?: string | null; status?: string; created_at?: string }
      >;
      relatorios: Table<
        { id: string; data: string; turma_id: string | null; autor: string | null; resumo: string | null; created_at: string },
        { id?: string; data: string; turma_id?: string | null; autor?: string | null; resumo?: string | null; created_at?: string },
        { id?: string; data?: string; turma_id?: string | null; autor?: string | null; resumo?: string | null; created_at?: string }
      >;
    };
    Views: { [_ in never]: never };
    Functions: { is_member: { Args: Record<PropertyKey, never>; Returns: boolean } };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];

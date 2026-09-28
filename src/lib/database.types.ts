export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_members: {
        Row: {
          created_at: string
          email: string
          nome: string | null
          papel: string
        }
        Insert: {
          created_at?: string
          email: string
          nome?: string | null
          papel?: string
        }
        Update: {
          created_at?: string
          email?: string
          nome?: string | null
          papel?: string
        }
        Relationships: []
      }
      aulas: {
        Row: {
          created_at: string
          data: string
          id: string
          turma_id: string | null
          turma_nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          turma_id?: string | null
          turma_nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          turma_id?: string | null
          turma_nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos_falta: {
        Row: {
          avisou_em: string
          contato_id: string
          created_at: string
          data: string
          id: string
          obs: string | null
          origem: string
          por: string
          turma_id: string
        }
        Insert: {
          avisou_em?: string
          contato_id: string
          created_at?: string
          data: string
          id?: string
          obs?: string | null
          origem?: string
          por: string
          turma_id: string
        }
        Update: {
          avisou_em?: string
          contato_id?: string
          created_at?: string
          data?: string
          id?: string
          obs?: string | null
          origem?: string
          por?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_falta_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avisos_falta_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avulsas: {
        Row: {
          contato_id: string
          data: string | null
          id: string
          status: string | null
          turma_id: string | null
        }
        Insert: {
          contato_id: string
          data?: string | null
          id?: string
          status?: string | null
          turma_id?: string | null
        }
        Update: {
          contato_id?: string
          data?: string | null
          id?: string
          status?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avulsas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avulsas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      confirmacoes: {
        Row: {
          contato_id: string
          data: string
          em: string
          id: string
          por: string
          status: string
          turma_id: string
        }
        Insert: {
          contato_id: string
          data: string
          em?: string
          id?: string
          por: string
          status: string
          turma_id: string
        }
        Update: {
          contato_id?: string
          data?: string
          em?: string
          id?: string
          por?: string
          status?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "confirmacoes_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confirmacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos: {
        Row: {
          created_at: string
          id: string
          nome: string
          obs: string | null
          origem: string | null
          tel: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          obs?: string | null
          origem?: string | null
          tel?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          obs?: string | null
          origem?: string | null
          tel?: string | null
        }
        Relationships: []
      }
      inscricoes: {
        Row: {
          contato_id: string
          id: string
          status: string | null
          workshop_id: string
        }
        Insert: {
          contato_id: string
          id?: string
          status?: string | null
          workshop_id: string
        }
        Update: {
          contato_id?: string
          id?: string
          status?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          categoria_id: string | null
          contato: string | null
          descricao: string
          id: string
          pago: boolean
          pago_em: string | null
          tipo: string
          valor: number
          vencimento: string
        }
        Insert: {
          categoria_id?: string | null
          contato?: string | null
          descricao: string
          id?: string
          pago?: boolean
          pago_em?: string | null
          tipo: string
          valor: number
          vencimento: string
        }
        Update: {
          categoria_id?: string | null
          contato?: string | null
          descricao?: string
          id?: string
          pago?: boolean
          pago_em?: string | null
          tipo?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "plano_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          contato_id: string
          created_at: string
          desde: string
          id: string
          mensalidade: number | null
          pagamento: string | null
          status: string
          turma_id: string | null
        }
        Insert: {
          contato_id: string
          created_at?: string
          desde?: string
          id?: string
          mensalidade?: number | null
          pagamento?: string | null
          status?: string
          turma_id?: string | null
        }
        Update: {
          contato_id?: string
          created_at?: string
          desde?: string
          id?: string
          mensalidade?: number | null
          pagamento?: string | null
          status?: string
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          contato_id: string
          created_at: string
          data: string
          forma: string
          id: string
          obs: string | null
          por: string
          tipo: string
          valor: number
        }
        Insert: {
          contato_id: string
          created_at?: string
          data?: string
          forma?: string
          id?: string
          obs?: string | null
          por: string
          tipo: string
          valor: number
        }
        Update: {
          contato_id?: string
          created_at?: string
          data?: string
          forma?: string
          id?: string
          obs?: string | null
          por?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      pecas: {
        Row: {
          contato_id: string
          created_at: string
          data_deixou: string | null
          data_pronta: string | null
          descricao: string | null
          estimativa: string | null
          etapa: string | null
          id: string
          prazo: string | null
          status: string
        }
        Insert: {
          contato_id: string
          created_at?: string
          data_deixou?: string | null
          data_pronta?: string | null
          descricao?: string | null
          estimativa?: string | null
          etapa?: string | null
          id?: string
          prazo?: string | null
          status?: string
        }
        Update: {
          contato_id?: string
          created_at?: string
          data_deixou?: string | null
          data_pronta?: string | null
          descricao?: string | null
          estimativa?: string | null
          etapa?: string | null
          id?: string
          prazo?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pecas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_categorias: {
        Row: {
          grupo_id: string
          id: string
          nome: string
          subgrupo_id: string | null
        }
        Insert: {
          grupo_id: string
          id?: string
          nome: string
          subgrupo_id?: string | null
        }
        Update: {
          grupo_id?: string
          id?: string
          nome?: string
          subgrupo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_categorias_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "plano_grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plano_categorias_subgrupo_id_fkey"
            columns: ["subgrupo_id"]
            isOneToOne: false
            referencedRelation: "plano_subgrupos"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_grupos: {
        Row: {
          classificacao: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          classificacao: string
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          classificacao?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      plano_subgrupos: {
        Row: {
          grupo_id: string
          id: string
          nome: string
        }
        Insert: {
          grupo_id: string
          id?: string
          nome: string
        }
        Update: {
          grupo_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_subgrupos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "plano_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          aula_id: string
          avulsa_id: string | null
          contato_id: string | null
          contato_nome: string
          created_at: string
          id: string
          matricula_id: string | null
          origem: string
          status: string
          updated_at: string
        }
        Insert: {
          aula_id: string
          avulsa_id?: string | null
          contato_id?: string | null
          contato_nome: string
          created_at?: string
          id?: string
          matricula_id?: string | null
          origem: string
          status: string
          updated_at?: string
        }
        Update: {
          aula_id?: string
          avulsa_id?: string | null
          contato_id?: string | null
          contato_nome?: string
          created_at?: string
          id?: string
          matricula_id?: string | null
          origem?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_avulsa_id_fkey"
            columns: ["avulsa_id"]
            isOneToOne: false
            referencedRelation: "avulsas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      promocoes: {
        Row: {
          ativa: boolean
          id: string
          nome: string
          quem: string | null
          regra: string
          validade: string | null
        }
        Insert: {
          ativa?: boolean
          id?: string
          nome: string
          quem?: string | null
          regra: string
          validade?: string | null
        }
        Update: {
          ativa?: boolean
          id?: string
          nome?: string
          quem?: string | null
          regra?: string
          validade?: string | null
        }
        Relationships: []
      }
      relatorios: {
        Row: {
          autor: string
          concluido_em: string | null
          created_at: string
          data: string
          id: string
          resumo: string | null
          turma_id: string | null
        }
        Insert: {
          autor: string
          concluido_em?: string | null
          created_at?: string
          data: string
          id?: string
          resumo?: string | null
          turma_id?: string | null
        }
        Update: {
          autor?: string
          concluido_em?: string | null
          created_at?: string
          data?: string
          id?: string
          resumo?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      reposicoes: {
        Row: {
          contato_id: string
          created_at: string
          destino_data: string
          destino_turma_id: string
          id: string
          origem_data: string
          origem_turma_id: string
        }
        Insert: {
          contato_id: string
          created_at?: string
          destino_data: string
          destino_turma_id: string
          id?: string
          origem_data: string
          origem_turma_id: string
        }
        Update: {
          contato_id?: string
          created_at?: string
          destino_data?: string
          destino_turma_id?: string
          id?: string
          origem_data?: string
          origem_turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposicoes_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposicoes_destino_turma_id_fkey"
            columns: ["destino_turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposicoes_origem_turma_id_fkey"
            columns: ["origem_turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          created_at: string
          data_abertura: string
          data_conclusao: string | null
          descricao: string | null
          id: string
          responsavel: string
          status: string
          titulo: string
        }
        Insert: {
          created_at?: string
          data_abertura?: string
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          responsavel: string
          status?: string
          titulo: string
        }
        Update: {
          created_at?: string
          data_abertura?: string
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          responsavel?: string
          status?: string
          titulo?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          capacidade: number
          dia: number | null
          fim: string | null
          hora: string | null
          id: string
          nome: string
        }
        Insert: {
          capacidade?: number
          dia?: number | null
          fim?: string | null
          hora?: string | null
          id?: string
          nome: string
        }
        Update: {
          capacidade?: number
          dia?: number | null
          fim?: string | null
          hora?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      workshops: {
        Row: {
          created_at: string
          datas: string | null
          id: string
          nome: string
          preco: string | null
        }
        Insert: {
          created_at?: string
          datas?: string | null
          id?: string
          nome: string
          preco?: string | null
        }
        Update: {
          created_at?: string
          datas?: string | null
          id?: string
          nome?: string
          preco?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_member_role: { Args: never; Returns: string }
      is_finance_member: { Args: never; Returns: boolean }
      is_member: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

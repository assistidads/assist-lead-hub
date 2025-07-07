export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alasan_bukan_leads: {
        Row: {
          bukan_leads: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          bukan_leads: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          bukan_leads?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kode_ads: {
        Row: {
          created_at: string | null
          id: string
          kode: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kode: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      layanan_assist: {
        Row: {
          created_at: string | null
          id: string
          layanan: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          layanan: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          layanan?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prospek: {
        Row: {
          alasan_bukan_leads_id: string | null
          created_at: string | null
          created_by: string
          id: string
          kode_ads_id: string | null
          kota: string
          layanan_assist_id: string | null
          nama_faskes: string
          nama_prospek: string
          no_whatsapp: string
          pic_leads_id: string | null
          provinsi_nama: string
          status_leads_id: string | null
          sumber_leads_id: string | null
          tanggal_prospek: string
          tipe_faskes_id: string | null
          updated_at: string | null
        }
        Insert: {
          alasan_bukan_leads_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          kode_ads_id?: string | null
          kota: string
          layanan_assist_id?: string | null
          nama_faskes: string
          nama_prospek: string
          no_whatsapp: string
          pic_leads_id?: string | null
          provinsi_nama: string
          status_leads_id?: string | null
          sumber_leads_id?: string | null
          tanggal_prospek: string
          tipe_faskes_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alasan_bukan_leads_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          kode_ads_id?: string | null
          kota?: string
          layanan_assist_id?: string | null
          nama_faskes?: string
          nama_prospek?: string
          no_whatsapp?: string
          pic_leads_id?: string | null
          provinsi_nama?: string
          status_leads_id?: string | null
          sumber_leads_id?: string | null
          tanggal_prospek?: string
          tipe_faskes_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospek_alasan_bukan_leads_id_fkey"
            columns: ["alasan_bukan_leads_id"]
            isOneToOne: false
            referencedRelation: "alasan_bukan_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospek_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospek_kode_ads_id_fkey"
            columns: ["kode_ads_id"]
            isOneToOne: false
            referencedRelation: "kode_ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospek_layanan_assist_id_fkey"
            columns: ["layanan_assist_id"]
            isOneToOne: false
            referencedRelation: "layanan_assist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospek_pic_leads_id_fkey"
            columns: ["pic_leads_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospek_status_leads_id_fkey"
            columns: ["status_leads_id"]
            isOneToOne: false
            referencedRelation: "status_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospek_sumber_leads_id_fkey"
            columns: ["sumber_leads_id"]
            isOneToOne: false
            referencedRelation: "sumber_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospek_tipe_faskes_id_fkey"
            columns: ["tipe_faskes_id"]
            isOneToOne: false
            referencedRelation: "tipe_faskes"
            referencedColumns: ["id"]
          },
        ]
      }
      status_leads: {
        Row: {
          created_at: string | null
          id: string
          status_leads: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status_leads: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status_leads?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sumber_leads: {
        Row: {
          created_at: string | null
          id: string
          sumber_leads: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sumber_leads: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sumber_leads?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tipe_faskes: {
        Row: {
          created_at: string | null
          id: string
          tipe_faskes: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tipe_faskes: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tipe_faskes?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

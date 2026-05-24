export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          city: string | null
          company_type: Database["public"]["Enums"]["company_type"]
          created_at: string
          id: string
          lat: number | null
          legal_name: string
          lng: number | null
          logo_url: string | null
          nit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_type?: Database["public"]["Enums"]["company_type"]
          created_at?: string
          id?: string
          lat?: number | null
          legal_name: string
          lng?: number | null
          logo_url?: string | null
          nit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_type?: Database["public"]["Enums"]["company_type"]
          created_at?: string
          id?: string
          lat?: number | null
          legal_name?: string
          lng?: number | null
          logo_url?: string | null
          nit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          created_at: string
          donor_company_id: string
          foundation_id: string | null
          id: string
          notes: string | null
          product_id: string
          status: Database["public"]["Enums"]["donation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          donor_company_id: string
          foundation_id?: string | null
          id?: string
          notes?: string | null
          product_id: string
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          donor_company_id?: string
          foundation_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_company_id_fkey"
            columns: ["donor_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_foundation_id_fkey"
            columns: ["foundation_id"]
            isOneToOne: false
            referencedRelation: "foundations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      foundations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          nit: string | null
          pickup_capacity_kg: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          nit?: string | null
          pickup_capacity_kg?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          nit?: string | null
          pickup_capacity_kg?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          description: string | null
          discount_price: number | null
          expires_at: string | null
          id: string
          images: string[] | null
          is_donation: boolean
          lat: number | null
          lng: number | null
          original_price: number | null
          quantity: number
          status: Database["public"]["Enums"]["product_status"]
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          discount_price?: number | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          is_donation?: boolean
          lat?: number | null
          lng?: number | null
          original_price?: number | null
          quantity?: number
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          discount_price?: number | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          is_donation?: boolean
          lat?: number | null
          lng?: number | null
          original_price?: number | null
          quantity?: number
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reputation: {
        Row: {
          comment: string | null
          created_at: string
          from_user_id: string
          id: string
          stars: number
          to_user_id: string
          transaction_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          stars: number
          to_user_id: string
          transaction_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          stars?: number
          to_user_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reputation_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          seller_company_id: string
          status: Database["public"]["Enums"]["transaction_status"]
          total: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          seller_company_id: string
          status?: Database["public"]["Enums"]["transaction_status"]
          total: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          seller_company_id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_company_id_fkey"
            columns: ["seller_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "empresa" | "consumidor" | "fundacion" | "admin"
      company_type:
        | "supermercado"
        | "restaurante"
        | "panaderia"
        | "agroindustria"
        | "tienda"
        | "otro"
      donation_status:
        | "solicitada"
        | "aprobada"
        | "recogida"
        | "entregada"
        | "cancelada"
      product_status:
        | "disponible"
        | "reservado"
        | "vendido"
        | "donado"
        | "expirado"
        | "eliminado"
      transaction_status:
        | "pendiente"
        | "confirmada"
        | "completada"
        | "cancelada"
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
    Enums: {
      app_role: ["empresa", "consumidor", "fundacion", "admin"],
      company_type: [
        "supermercado",
        "restaurante",
        "panaderia",
        "agroindustria",
        "tienda",
        "otro",
      ],
      donation_status: [
        "solicitada",
        "aprobada",
        "recogida",
        "entregada",
        "cancelada",
      ],
      product_status: [
        "disponible",
        "reservado",
        "vendido",
        "donado",
        "expirado",
      ],
      transaction_status: [
        "pendiente",
        "confirmada",
        "completada",
        "cancelada",
      ],
    },
  },
} as const

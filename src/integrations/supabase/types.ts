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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client: string | null
          created_at: string
          date: string
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          responsible: string
          status: string
          time: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client?: string | null
          created_at?: string
          date: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          responsible: string
          status?: string
          time: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string | null
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          responsible?: string
          status?: string
          time?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drone_flights: {
        Row: {
          application_width: number
          area_covered: number | null
          created_at: string
          culture: string
          droplet_type: string
          flight_date: string
          flight_height: number
          flow_rate: number
          id: string
          notes: string | null
          products: Json
          solid_products: Json
          speed: number
          total_volume: number | null
          updated_at: string
          user_id: string
          weather_conditions: string | null
        }
        Insert: {
          application_width: number
          area_covered?: number | null
          created_at?: string
          culture: string
          droplet_type: string
          flight_date?: string
          flight_height: number
          flow_rate: number
          id?: string
          notes?: string | null
          products?: Json
          solid_products?: Json
          speed: number
          total_volume?: number | null
          updated_at?: string
          user_id: string
          weather_conditions?: string | null
        }
        Update: {
          application_width?: number
          area_covered?: number | null
          created_at?: string
          culture?: string
          droplet_type?: string
          flight_date?: string
          flight_height?: number
          flow_rate?: number
          id?: string
          notes?: string | null
          products?: Json
          solid_products?: Json
          speed?: number
          total_volume?: number | null
          updated_at?: string
          user_id?: string
          weather_conditions?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          city: string | null
          created_at: string
          email: string
          farm: string | null
          hectares: number | null
          id: string
          main_crop: string | null
          name: string
          notes: string | null
          other_crops: string | null
          phone: string
          state: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          farm?: string | null
          hectares?: number | null
          id?: string
          main_crop?: string | null
          name: string
          notes?: string | null
          other_crops?: string | null
          phone: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          farm?: string | null
          hectares?: number | null
          id?: string
          main_crop?: string | null
          name?: string
          notes?: string | null
          other_crops?: string | null
          phone?: string
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          email: string
          empresa: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email: string
          empresa?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spray_calculations: {
        Row: {
          area: number
          created_at: string
          id: string
          name: string
          products: Json
          results: Json
          spray_rate: number
          tank_volume: number
          updated_at: string
          user_id: string
        }
        Insert: {
          area: number
          created_at?: string
          id?: string
          name: string
          products: Json
          results: Json
          spray_rate: number
          tank_volume: number
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number
          created_at?: string
          id?: string
          name?: string
          products?: Json
          results?: Json
          spray_rate?: number
          tank_volume?: number
          updated_at?: string
          user_id?: string
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

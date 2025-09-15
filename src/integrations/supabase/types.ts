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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      itineraries: {
        Row: {
          budget: string
          consultant_company: string | null
          consultant_email: string | null
          consultant_logo: string | null
          consultant_name: string | null
          consultant_phone: string | null
          created_at: string
          departure_flight: string | null
          destination: string
          duration: string
          end_date: string
          exclusions: string[] | null
          hotel_name: string | null
          hotel_nights: number | null
          hotel_rating: string | null
          id: string
          inclusions: string[] | null
          return_flight: string | null
          share_token: string | null
          start_date: string
          status: string
          theme: string
          title: string
          travelers: number
          updated_at: string
          version: number
        }
        Insert: {
          budget: string
          consultant_company?: string | null
          consultant_email?: string | null
          consultant_logo?: string | null
          consultant_name?: string | null
          consultant_phone?: string | null
          created_at?: string
          departure_flight?: string | null
          destination: string
          duration: string
          end_date: string
          exclusions?: string[] | null
          hotel_name?: string | null
          hotel_nights?: number | null
          hotel_rating?: string | null
          id?: string
          inclusions?: string[] | null
          return_flight?: string | null
          share_token?: string | null
          start_date: string
          status?: string
          theme: string
          title: string
          travelers?: number
          updated_at?: string
          version?: number
        }
        Update: {
          budget?: string
          consultant_company?: string | null
          consultant_email?: string | null
          consultant_logo?: string | null
          consultant_name?: string | null
          consultant_phone?: string | null
          created_at?: string
          departure_flight?: string | null
          destination?: string
          duration?: string
          end_date?: string
          exclusions?: string[] | null
          hotel_name?: string | null
          hotel_nights?: number | null
          hotel_rating?: string | null
          id?: string
          inclusions?: string[] | null
          return_flight?: string | null
          share_token?: string | null
          start_date?: string
          status?: string
          theme?: string
          title?: string
          travelers?: number
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      itinerary_comments: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          itinerary_id: string
          line_item: string | null
          section: string
          status: string
          type: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          itinerary_id: string
          line_item?: string | null
          section: string
          status?: string
          type?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          itinerary_id?: string
          line_item?: string | null
          section?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_comments_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_days: {
        Row: {
          accommodation: string | null
          activities: string[] | null
          city: string
          created_at: string
          date: string
          day: number
          description: string | null
          id: string
          images: string[] | null
          itinerary_id: string
          meals: string | null
          title: string
        }
        Insert: {
          accommodation?: string | null
          activities?: string[] | null
          city: string
          created_at?: string
          date: string
          day: number
          description?: string | null
          id?: string
          images?: string[] | null
          itinerary_id: string
          meals?: string | null
          title: string
        }
        Update: {
          accommodation?: string | null
          activities?: string[] | null
          city?: string
          created_at?: string
          date?: string
          day?: number
          description?: string | null
          id?: string
          images?: string[] | null
          itinerary_id?: string
          meals?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_days_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
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

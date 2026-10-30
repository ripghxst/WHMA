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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      breeds: {
        Row: {
          code: string | null
          id: number
          is_classified: boolean
          name: string
          sort_order: number
        }
        Insert: {
          code?: string | null
          id?: never
          is_classified?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          code?: string | null
          id?: never
          is_classified?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      horse_photos: {
        Row: {
          created_at: string
          horse_id: string
          id: string
          is_primary: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          horse_id: string
          id?: string
          is_primary?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          created_at?: string
          horse_id?: string
          id?: string
          is_primary?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_dam_id"]
          },
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_id"]
          },
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_sire_id"]
          },
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["horse_id"]
          },
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_dam_id"]
          },
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_id"]
          },
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_sire_id"]
          },
          {
            foreignKeyName: "horse_photos_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horse_reviews: {
        Row: {
          action: Database["public"]["Enums"]["review_action"]
          actor_id: string | null
          created_at: string
          horse_id: string
          id: number
          note: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["review_action"]
          actor_id?: string | null
          created_at?: string
          horse_id: string
          id?: never
          note?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["review_action"]
          actor_id?: string | null
          created_at?: string
          horse_id?: string
          id?: never
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horse_reviews_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_dam_id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_sire_id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["horse_id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_dam_id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_sire_id"]
          },
          {
            foreignKeyName: "horse_reviews_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horses: {
        Row: {
          barn_name: string | null
          base_stats: string | null
          breed_id: number | null
          created_at: string
          dam_breed_id: number | null
          dam_id: string | null
          dam_name: string | null
          eye_color: string | null
          genotype: string | null
          height: string | null
          id: string
          is_foundation: boolean
          legacy_owner_discord: string | null
          legacy_owner_name: string | null
          owner_id: string | null
          pedigree: string | null
          phenotype: string | null
          registered_name: string
          registration_date: string | null
          registration_number: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sex: Database["public"]["Enums"]["horse_sex"] | null
          sire_breed_id: number | null
          sire_id: string | null
          sire_name: string | null
          status: Database["public"]["Enums"]["horse_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          barn_name?: string | null
          base_stats?: string | null
          breed_id?: number | null
          created_at?: string
          dam_breed_id?: number | null
          dam_id?: string | null
          dam_name?: string | null
          eye_color?: string | null
          genotype?: string | null
          height?: string | null
          id?: string
          is_foundation?: boolean
          legacy_owner_discord?: string | null
          legacy_owner_name?: string | null
          owner_id?: string | null
          pedigree?: string | null
          phenotype?: string | null
          registered_name: string
          registration_date?: string | null
          registration_number?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sex?: Database["public"]["Enums"]["horse_sex"] | null
          sire_breed_id?: number | null
          sire_id?: string | null
          sire_name?: string | null
          status?: Database["public"]["Enums"]["horse_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          barn_name?: string | null
          base_stats?: string | null
          breed_id?: number | null
          created_at?: string
          dam_breed_id?: number | null
          dam_id?: string | null
          dam_name?: string | null
          eye_color?: string | null
          genotype?: string | null
          height?: string | null
          id?: string
          is_foundation?: boolean
          legacy_owner_discord?: string | null
          legacy_owner_name?: string | null
          owner_id?: string | null
          pedigree?: string | null
          phenotype?: string | null
          registered_name?: string
          registration_date?: string | null
          registration_number?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sex?: Database["public"]["Enums"]["horse_sex"] | null
          sire_breed_id?: number | null
          sire_id?: string | null
          sire_name?: string | null
          status?: Database["public"]["Enums"]["horse_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "horses_breed_id_fkey"
            columns: ["breed_id"]
            isOneToOne: false
            referencedRelation: "breeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horses_dam_breed_id_fkey"
            columns: ["dam_breed_id"]
            isOneToOne: false
            referencedRelation: "breeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_dam_id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_sire_id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["horse_id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_dam_id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_sire_id"]
          },
          {
            foreignKeyName: "horses_dam_id_fkey"
            columns: ["dam_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horses_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horses_sire_breed_id_fkey"
            columns: ["sire_breed_id"]
            isOneToOne: false
            referencedRelation: "breeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_dam_id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["dam_sire_id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["horse_id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_dam_id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horse_pedigree"
            referencedColumns: ["sire_sire_id"]
          },
          {
            foreignKeyName: "horses_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          discord_username: string | null
          display_name: string
          id: string
          in_game_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          discord_username?: string | null
          display_name: string
          id: string
          in_game_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          discord_username?: string | null
          display_name?: string
          id?: string
          in_game_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      horse_pedigree: {
        Row: {
          dam_breed: string | null
          dam_dam_breed: string | null
          dam_dam_id: string | null
          dam_dam_name: string | null
          dam_dam_number: string | null
          dam_id: string | null
          dam_name: string | null
          dam_number: string | null
          dam_sire_breed: string | null
          dam_sire_id: string | null
          dam_sire_name: string | null
          dam_sire_number: string | null
          horse_id: string | null
          sire_breed: string | null
          sire_dam_breed: string | null
          sire_dam_id: string | null
          sire_dam_name: string | null
          sire_dam_number: string | null
          sire_id: string | null
          sire_name: string | null
          sire_number: string | null
          sire_sire_breed: string | null
          sire_sire_id: string | null
          sire_sire_name: string | null
          sire_sire_number: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_registration_number: {
        Args: { p_horse_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "member" | "admin"
      horse_sex: "stallion" | "mare" | "gelding"
      horse_status:
        | "draft"
        | "pending"
        | "changes_requested"
        | "approved"
        | "rejected"
      review_action:
        | "submitted"
        | "approved"
        | "changes_requested"
        | "rejected"
        | "edited"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["member", "admin"],
      horse_sex: ["stallion", "mare", "gelding"],
      horse_status: [
        "draft",
        "pending",
        "changes_requested",
        "approved",
        "rejected",
      ],
      review_action: [
        "submitted",
        "approved",
        "changes_requested",
        "rejected",
        "edited",
      ],
    },
  },
} as const

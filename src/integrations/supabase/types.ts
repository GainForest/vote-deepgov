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
      event_allowlist: {
        Row: {
          created_at: string | null
          email: string
          event_id: string | null
          has_registered: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id?: string | null
          has_registered?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string | null
          has_registered?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_allowlist_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          admin: boolean
          available_votes: number | null
          event_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          admin?: boolean
          available_votes?: number | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          admin?: boolean
          available_votes?: number | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          funding_pool: number | null
          id: string
          name: string | null
          start_date: string | null
          votes_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          funding_pool?: number | null
          id?: string
          name?: string | null
          start_date?: string | null
          votes_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          funding_pool?: number | null
          id?: string
          name?: string | null
          start_date?: string | null
          votes_active?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin: boolean | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          name_requested: boolean | null
        }
        Insert: {
          admin?: boolean | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          name_requested?: boolean | null
        }
        Update: {
          admin?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          name_requested?: boolean | null
        }
        Relationships: []
      }
      project_allocations: {
        Row: {
          event_id: string
          project_id: string
          reaction: string | null
          user_id: string
          votes: number | null
        }
        Insert: {
          event_id: string
          project_id: string
          reaction?: string | null
          user_id: string
          votes?: number | null
        }
        Update: {
          event_id?: string
          project_id?: string
          reaction?: string | null
          user_id?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_allocations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_votes"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_allocations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_matching: {
        Row: {
          contribution_amount: number | null
          event_id: string
          matching_amount: number | null
          number_contributions: number | null
          project_id: string
        }
        Insert: {
          contribution_amount?: number | null
          event_id: string
          matching_amount?: number | null
          number_contributions?: number | null
          project_id: string
        }
        Update: {
          contribution_amount?: number | null
          event_id?: string
          matching_amount?: number | null
          number_contributions?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_matching_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_matching_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_votes"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_matching_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          metadata: Json | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          event_id: string | null
          id: string
          previous_amount: number | null
          project_id: string | null
          type: Database["public"]["Enums"]["transaction_type"] | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          previous_amount?: number | null
          project_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"] | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          previous_amount?: number | null
          project_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_votes"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_votes: {
        Row: {
          last_updated: string | null
          project_id: string | null
          total_votes: number | null
          unique_voters: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      allocate_votes: {
        Args: {
          p_event_id: string
          p_project_id: string
          p_amount: number
          p_reaction?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      transaction_type: "vote_allocation" | "vote_update"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

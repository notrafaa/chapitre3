// ===========================================================================
//  Chapitre 3 — Types de la base de données Supabase
//  Correspond aux migrations supabase/migrations/*.sql
//
//  Pour régénérer automatiquement après modification du schéma :
//    npx supabase gen types typescript --project-id <id> > src/types/database.ts
// ===========================================================================

export type ProjectStatus =
  | "idea"
  | "building"
  | "published"
  | "paused"
  | "archived";

export type ProjectVisibility = "public" | "teaser" | "private";

export type ProjectStage =
  | "concept"
  | "identity"
  | "construction"
  | "test"
  | "publication";

export type SubmissionStatus = "new" | "reviewing" | "contacted" | "archived";

export type ContactStatus = "new" | "read" | "replied" | "archived";

export type MediaType = "image" | "video";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          project_number: number;
          short_description: string | null;
          long_description: string | null;
          story: string | null;
          objectives: string[];
          features: string[];
          category: string | null;
          status: ProjectStatus;
          visibility: ProjectVisibility;
          current_stage: ProjectStage | null;
          external_url: string | null;
          logo_url: string | null;
          cover_url: string | null;
          launch_date: string | null;
          featured: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          project_number?: number;
          short_description?: string | null;
          long_description?: string | null;
          story?: string | null;
          objectives?: string[];
          features?: string[];
          category?: string | null;
          status?: ProjectStatus;
          visibility?: ProjectVisibility;
          current_stage?: ProjectStage | null;
          external_url?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          launch_date?: string | null;
          featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          media_url: string;
          media_type: MediaType;
          alt_text: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          media_url: string;
          media_type?: MediaType;
          alt_text?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_media"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          role: string | null;
          avatar_url: string | null;
          link: string | null;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          role?: string | null;
          avatar_url?: string | null;
          link?: string | null;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      launch_subscribers: {
        Row: {
          id: string;
          project_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["launch_subscribers"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "launch_subscribers_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_submissions: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          contact_method: string | null;
          project_name: string | null;
          idea: string;
          help_type: string | null;
          consent: boolean;
          status: SubmissionStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email: string;
          contact_method?: string | null;
          project_name?: string | null;
          idea: string;
          help_type?: string | null;
          consent?: boolean;
          status?: SubmissionStatus;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_submissions"]["Insert"]
        >;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          status: ContactStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          status?: ContactStatus;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["contact_messages"]["Insert"]
        >;
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      ad_links: {
        Row: {
          id: string;
          name: string;
          slug: string;
          destination_url: string;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          destination_url: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ad_links"]["Insert"]>;
        Relationships: [];
      };
      ad_link_visits: {
        Row: {
          id: string;
          ad_link_id: string;
          country_code: string | null;
          referer: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ad_link_id: string;
          country_code?: string | null;
          referer?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ad_link_visits"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "ad_link_visits_ad_link_id_fkey";
            columns: ["ad_link_id"];
            referencedRelation: "ad_links";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      project_status: ProjectStatus;
      project_visibility: ProjectVisibility;
      project_stage: ProjectStage;
      submission_status: SubmissionStatus;
      contact_status: ContactStatus;
      media_type: MediaType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/**
 * This file contains TypeScript type definitions for the Supabase database schema.
 * It helps provide strong typing for database operations in the application.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string
          created_at: string
          question: string
          user_id: string | null
          is_public: boolean
          settings: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          question: string
          user_id?: string | null
          is_public?: boolean
          settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          question?: string
          user_id?: string | null
          is_public?: boolean
          settings?: Json | null
        }
      }
      options: {
        Row: {
          id: string
          poll_id: string
          text: string
          created_at: string
          order: number | null
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          created_at?: string
          order?: number | null
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          created_at?: string
          order?: number | null
        }
      }
      votes: {
        Row: {
          id: string
          created_at: string
          poll_id: string
          option_id: string
          voter_id: string | null
          voter_ip: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          poll_id: string
          option_id: string
          voter_id?: string | null
          voter_ip?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          poll_id?: string
          option_id?: string
          voter_id?: string | null
          voter_ip?: string | null
        }
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
  }
}

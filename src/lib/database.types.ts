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
          position: number | null  // Renamed from 'order' to avoid SQL reserved keyword
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          created_at?: string
          position?: number | null  // Renamed from 'order' to avoid SQL reserved keyword
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          created_at?: string
          position?: number | null  // Renamed from 'order' to avoid SQL reserved keyword
        }
      }
      votes: {
        Row: {
          id: string
          created_at: string
          poll_id: string
          option_id: string
          voter_id: string | null
          voter_hash: string | null  // Renamed from voter_ip and should store hashed IP addresses
        }
        Insert: {
          id?: string
          created_at?: string
          poll_id: string
          option_id: string
          voter_id?: string | null
          voter_hash?: string | null  // Renamed from voter_ip and should store hashed IP addresses
        }
        Update: {
          id?: string
          created_at?: string
          poll_id?: string
          option_id?: string
          voter_id?: string | null
          voter_hash?: string | null  // Renamed from voter_ip and should store hashed IP addresses
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

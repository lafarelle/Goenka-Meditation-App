/**
 * Database type definitions for Supabase
 * This file defines the TypeScript types for your database schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          device_id: string;
          name: string | null;
          country: string | null;
          has_attended_retreat: boolean | null;
          goenka_familiarity: 'goat' | 'heard' | 'not-really' | null;
          wants_gong: boolean | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          device_id: string;
          name?: string | null;
          country?: string | null;
          has_attended_retreat?: boolean | null;
          goenka_familiarity?: 'goat' | 'heard' | 'not-really' | null;
          wants_gong?: boolean | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          device_id?: string;
          name?: string | null;
          country?: string | null;
          has_attended_retreat?: boolean | null;
          goenka_familiarity?: 'goat' | 'heard' | 'not-really' | null;
          wants_gong?: boolean | null;
        };
      };
      meditation_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          started_at: string;
          ended_at: string | null;
          total_duration_minutes: number;
          actual_duration_sec: number | null; // REAL - supports decimals
          completed: boolean;
          stopped_at: number | null; // REAL - supports decimals
          completion_percentage: number; // REAL - supports decimals
          preferences: Json;
          segments: Json;
          calculated_durations: Json;
          playback_sequence: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          started_at: string;
          ended_at?: string | null;
          total_duration_minutes: number;
          actual_duration_sec?: number | null; // REAL - supports decimals
          completed?: boolean;
          stopped_at?: number | null; // REAL - supports decimals
          completion_percentage?: number; // REAL - supports decimals
          preferences: Json;
          segments: Json;
          calculated_durations: Json;
          playback_sequence?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          started_at?: string;
          ended_at?: string | null;
          total_duration_minutes?: number;
          actual_duration_sec?: number | null; // REAL - supports decimals
          completed?: boolean;
          stopped_at?: number | null; // REAL - supports decimals
          completion_percentage?: number; // REAL - supports decimals
          preferences?: Json;
          segments?: Json;
          calculated_durations?: Json;
          playback_sequence?: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      goenka_familiarity_enum: 'goat' | 'heard' | 'not-really';
    };
  };
}

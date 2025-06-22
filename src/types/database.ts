export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          timezone: string;
          currency_code: string;
          owner_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          timezone?: string;
          currency_code?: string;
          owner_user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          timezone?: string;
          currency_code?: string;
          owner_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_organizations: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          role: 'owner' | 'admin' | 'staff' | 'advisor';
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          role: 'owner' | 'admin' | 'staff' | 'advisor';
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          role?: 'owner' | 'admin' | 'staff' | 'advisor';
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
          parent_account_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
          parent_account_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          code?: string;
          name?: string;
          type?: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
          parent_account_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          organization_id: string;
          date: string;
          description: string;
          reference: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          date: string;
          description: string;
          reference?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          date?: string;
          description?: string;
          reference?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_lines: {
        Row: {
          id: string;
          entry_id: string;
          account_id: string;
          debit: number;
          credit: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          account_id: string;
          debit?: number;
          credit?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          account_id?: string;
          debit?: number;
          credit?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
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
      [_ in never]: never;
    };
  };
}
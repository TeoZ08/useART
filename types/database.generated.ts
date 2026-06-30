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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          active: boolean
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      colors: {
        Row: {
          active: boolean
          hex: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          hex: string
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          hex?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          consumed_at: string | null
          coupon_id: string
          created_at: string
          customer_key_hash: string
          id: string
          order_id: string
          status: string
        }
        Insert: {
          consumed_at?: string | null
          coupon_id: string
          created_at?: string
          customer_key_hash: string
          id?: string
          order_id: string
          status?: string
        }
        Update: {
          consumed_at?: string | null
          coupon_id?: string
          created_at?: string
          customer_key_hash?: string
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          ends_at: string | null
          first_order_only: boolean
          id: string
          max_redemptions: number | null
          max_redemptions_per_customer: number | null
          maximum_discount_cents: number | null
          minimum_subtotal_cents: number | null
          review_required: boolean
          starts_at: string | null
          updated_at: string
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type: string
          ends_at?: string | null
          first_order_only?: boolean
          id?: string
          max_redemptions?: number | null
          max_redemptions_per_customer?: number | null
          maximum_discount_cents?: number | null
          minimum_subtotal_cents?: number | null
          review_required?: boolean
          starts_at?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          ends_at?: string | null
          first_order_only?: boolean
          id?: string
          max_redemptions?: number | null
          max_redemptions_per_customer?: number | null
          maximum_discount_cents?: number | null
          minimum_subtotal_cents?: number | null
          review_required?: boolean
          starts_at?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          quantity: number
          status: string
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          order_id: string
          quantity: number
          status?: string
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          quantity?: number
          status?: string
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_rules: {
        Row: {
          allowed_application_ids: string[]
          allowed_color_ids: string[]
          allowed_size_ids: string[]
          piece_count: number
          product_id: string
        }
        Insert: {
          allowed_application_ids?: string[]
          allowed_color_ids?: string[]
          allowed_size_ids?: string[]
          piece_count?: number
          product_id: string
        }
        Update: {
          allowed_application_ids?: string[]
          allowed_color_ids?: string[]
          allowed_size_ids?: string[]
          piece_count?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_snapshot: string | null
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          product_slug_snapshot: string
          quantity: number
          selection: Json
          sku_snapshot: string | null
          unit_price_cents: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_snapshot?: string | null
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          product_slug_snapshot: string
          quantity: number
          selection: Json
          sku_snapshot?: string | null
          unit_price_cents: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_snapshot?: string | null
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          product_slug_snapshot?: string
          quantity?: number
          selection?: Json
          sku_snapshot?: string | null
          unit_price_cents?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_user_id: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          source: string
          to_status: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          source: string
          to_status: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          source?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json | null
          checkout_idempotency_key: string
          coupon_code_snapshot: string | null
          coupon_id: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_email_normalized: string | null
          customer_name: string
          customer_phone: string
          customer_phone_normalized: string
          discount_cents: number
          expires_at: string | null
          id: string
          notes: string | null
          order_code: string
          paid_at: string | null
          payment_status: string
          privacy_accepted_at: string
          privacy_terms_version: string
          public_token_hash: string
          shipping_cents: number | null
          shipping_method: string
          status: string
          subtotal_cents: number
          total_cents: number | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          checkout_idempotency_key: string
          coupon_code_snapshot?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_email_normalized?: string | null
          customer_name: string
          customer_phone: string
          customer_phone_normalized: string
          discount_cents?: number
          expires_at?: string | null
          id?: string
          notes?: string | null
          order_code: string
          paid_at?: string | null
          payment_status?: string
          privacy_accepted_at: string
          privacy_terms_version: string
          public_token_hash: string
          shipping_cents?: number | null
          shipping_method: string
          status?: string
          subtotal_cents: number
          total_cents?: number | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          checkout_idempotency_key?: string
          coupon_code_snapshot?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_email_normalized?: string | null
          customer_name?: string
          customer_phone?: string
          customer_phone_normalized?: string
          discount_cents?: number
          expires_at?: string | null
          id?: string
          notes?: string | null
          order_code?: string
          paid_at?: string | null
          payment_status?: string
          privacy_accepted_at?: string
          privacy_terms_version?: string
          public_token_hash?: string
          shipping_cents?: number | null
          shipping_method?: string
          status?: string
          subtotal_cents?: number
          total_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount_cents: number
          checkout_url: string | null
          created_at: string
          currency: string
          id: string
          idempotency_key: string
          order_id: string
          preference_id: string | null
          provider: string
          provider_payment_id: string | null
          raw_status: string | null
          sandbox: boolean
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          checkout_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          idempotency_key: string
          order_id: string
          preference_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          raw_status?: string | null
          sandbox: boolean
          status: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          checkout_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string
          order_id?: string
          preference_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          raw_status?: string | null
          sandbox?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          processed: boolean
          processed_at: string | null
          processing_error: string | null
          provider: string
          provider_event_id: string | null
          provider_payment_id: string | null
          request_id: string | null
          signature_valid: boolean
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          provider: string
          provider_event_id?: string | null
          provider_payment_id?: string | null
          request_id?: string | null
          signature_valid: boolean
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          provider?: string
          provider_event_id?: string | null
          provider_payment_id?: string | null
          request_id?: string | null
          signature_valid?: boolean
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string
          application_id: string | null
          color_id: string | null
          created_at: string
          cutout_status: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          static_path: string | null
          status: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          alt: string
          application_id?: string | null
          color_id?: string | null
          created_at?: string
          cutout_status?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          static_path?: string | null
          status: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          alt?: string
          application_id?: string | null
          color_id?: string | null
          created_at?: string
          cutout_status?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          static_path?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          application_id: string | null
          availability_mode: string
          color_id: string | null
          created_at: string
          id: string
          price_override_cents: number | null
          product_id: string
          size_id: string | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          application_id?: string | null
          availability_mode?: string
          color_id?: string | null
          created_at?: string
          id?: string
          price_override_cents?: number | null
          product_id: string
          size_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          application_id?: string | null
          availability_mode?: string
          color_id?: string | null
          created_at?: string
          id?: string
          price_override_cents?: number | null
          product_id?: string
          size_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          availability_mode: string
          base_price_cents: number
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          kind: string
          lead_time_days: number | null
          line: string
          name: string
          review_required: boolean
          seo_description: string
          seo_title: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          availability_mode?: string
          base_price_cents: number
          category: string
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          kind: string
          lead_time_days?: number | null
          line: string
          name: string
          review_required?: boolean
          seo_description: string
          seo_title: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          availability_mode?: string
          base_price_cents?: number
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          kind?: string
          lead_time_days?: number | null
          line?: string
          name?: string
          review_required?: boolean
          seo_description?: string
          seo_title?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      sizes: {
        Row: {
          active: boolean
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          default_lead_time_days: number
          local_delivery_city: string
          local_delivery_enabled: boolean
          local_delivery_fee_cents: number
          local_delivery_state: string
          national_quote_enabled: boolean
          payments_enabled: boolean
          pickup_enabled: boolean
          singleton: boolean
          store_mode: string
          support_email: string | null
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          default_lead_time_days?: number
          local_delivery_city?: string
          local_delivery_enabled?: boolean
          local_delivery_fee_cents?: number
          local_delivery_state?: string
          national_quote_enabled?: boolean
          payments_enabled?: boolean
          pickup_enabled?: boolean
          singleton?: boolean
          store_mode?: string
          support_email?: string | null
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          default_lead_time_days?: number
          local_delivery_city?: string
          local_delivery_enabled?: boolean
          local_delivery_fee_cents?: number
          local_delivery_state?: string
          national_quote_enabled?: boolean
          payments_enabled?: boolean
          pickup_enabled?: boolean
          singleton?: boolean
          store_mode?: string
          support_email?: string | null
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_v1: {
        Args: {
          p_address: Json
          p_checkout_idempotency_key: string
          p_coupon_code: string
          p_customer_email: string
          p_customer_email_normalized: string
          p_customer_key_hash: string
          p_customer_name: string
          p_customer_phone: string
          p_customer_phone_normalized: string
          p_items: Json
          p_notes: string
          p_privacy_terms_version: string
          p_public_token_hash: string
          p_shipping_method: string
        }
        Returns: Json
      }
      current_admin_role: { Args: never; Returns: string }
      expire_order_resources_v1: { Args: never; Returns: number }
      is_active_admin: { Args: { allowed_roles?: string[] }; Returns: boolean }
      is_valid_order_selection: { Args: { selection: Json }; Returns: boolean }
      mark_order_paid_v1: {
        Args: {
          p_order_id: string
          p_provider_payment_id: string
          p_raw_status: string
        }
        Returns: undefined
      }
      release_order_resources_v1: {
        Args: {
          p_note?: string
          p_order_id: string
          p_source: string
          p_target_status: string
        }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			calendar_events: {
				Row: {
					created_at: string;
					description: string | null;
					end_time: string;
					id: string;
					last_modified_at: string;
					page_id: string;
					start_time: string;
					title: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					end_time: string;
					id?: string;
					last_modified_at?: string;
					page_id: string;
					start_time: string;
					title: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					end_time?: string;
					id?: string;
					last_modified_at?: string;
					page_id?: string;
					start_time?: string;
					title?: string;
				};
				Relationships: [
					{
						foreignKeyName: "calendar_events_page_id_fkey";
						columns: ["page_id"];
						isOneToOne: false;
						referencedRelation: "pages";
						referencedColumns: ["id"];
					}
				];
			};
			notifications: {
				Row: {
					created_at: string;
					data: Json | null;
					id: string;
					is_read: boolean;
					link_to: string | null;
					type: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					data?: Json | null;
					id?: string;
					is_read?: boolean;
					link_to?: string | null;
					type: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					data?: Json | null;
					id?: string;
					is_read?: boolean;
					link_to?: string | null;
					type?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			page_blocks: {
				Row: {
					content: Json | null;
					created_at: string;
					id: string;
					last_modified_at: string;
					page_id: string;
					sort_order: number;
					type: Database["public"]["Enums"]["page_block_type"];
					user_id: string;
				};
				Insert: {
					content?: Json | null;
					created_at?: string;
					id?: string;
					last_modified_at?: string;
					page_id: string;
					sort_order?: number;
					type: Database["public"]["Enums"]["page_block_type"];
					user_id: string;
				};
				Update: {
					content?: Json | null;
					created_at?: string;
					id?: string;
					last_modified_at?: string;
					page_id?: string;
					sort_order?: number;
					type?: Database["public"]["Enums"]["page_block_type"];
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "page_blocks_page_id_fkey";
						columns: ["page_id"];
						isOneToOne: false;
						referencedRelation: "pages";
						referencedColumns: ["id"];
					}
				];
			};
			page_templates: {
				Row: {
					created_at: string;
					description: string | null;
					id: string;
					name: string;
					template_content: string;
					type: Database["public"]["Enums"]["page_type"];
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					id?: string;
					name: string;
					template_content: string;
					type?: Database["public"]["Enums"]["page_type"];
				};
				Update: {
					created_at?: string;
					description?: string | null;
					id?: string;
					name?: string;
					template_content?: string;
					type?: Database["public"]["Enums"]["page_type"];
				};
				Relationships: [];
			};
			pages: {
				Row: {
					content: Json | null;
					created_at: string;
					id: string;
					is_shared: boolean;
					last_modified_at: string;
					shared_with: string[] | null;
					title: string;
					trashed_at: string | null;
					type: Database["public"]["Enums"]["page_type"];
					user_id: string;
				};
				Insert: {
					content?: Json | null;
					created_at?: string;
					id?: string;
					is_shared?: boolean;
					last_modified_at?: string;
					shared_with?: string[] | null;
					title?: string;
					trashed_at?: string | null;
					type?: Database["public"]["Enums"]["page_type"];
					user_id: string;
				};
				Update: {
					content?: Json | null;
					created_at?: string;
					id?: string;
					is_shared?: boolean;
					last_modified_at?: string;
					shared_with?: string[] | null;
					title?: string;
					trashed_at?: string | null;
					type?: Database["public"]["Enums"]["page_type"];
					user_id?: string;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					avatar_url: string | null;
					has_completed_onboarding: boolean;
					id: string;
					receive_notifications: boolean;
					theme: string;
					updated_at: string;
					username: string | null;
					workspace_icon_url: string | null;
					workspace_name: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					has_completed_onboarding?: boolean;
					id: string;
					receive_notifications?: boolean;
					theme?: string;
					updated_at?: string;
					username?: string | null;
					workspace_icon_url?: string | null;
					workspace_name?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					has_completed_onboarding?: boolean;
					id?: string;
					receive_notifications?: boolean;
					theme?: string;
					updated_at?: string;
					username?: string | null;
					workspace_icon_url?: string | null;
					workspace_name?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			delete_user_account: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			delete_workspace: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			get_page_templates_by_type: {
				Args: { p_type: Database["public"]["Enums"]["page_type"] };
				Returns: {
					id: string;
					created_at: string;
					name: string;
					description: string;
					template_content: string;
				}[];
			};
		};
		Enums: {
			page_block_type:
				| "paragraph"
				| "heading1"
				| "heading2"
				| "heading3"
				| "todo";
			page_type: "DOCUMENT" | "KANBAN" | "CHART" | "CALENDAR" | "LIST";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
			DefaultSchema["Views"])
	? (DefaultSchema["Tables"] &
			DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
	? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
	? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;

export const Constants = {
	public: {
		Enums: {
			page_block_type: [
				"paragraph",
				"heading1",
				"heading2",
				"heading3",
				"todo",
			],
			page_type: ["DOCUMENT", "KANBAN", "CHART", "CALENDAR", "LIST"],
		},
	},
} as const;

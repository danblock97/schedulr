import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function useIpcSupabase() {
	useEffect(() => {
		if (!window.electron?.onSupabaseLogin) return;
		const handler = async (tokens: { access: string; refresh: string }) => {
			try {
				await supabase.auth.setSession({
					access_token: tokens.access,
					refresh_token: tokens.refresh,
				});
				// Optionally reload or navigate
				window.location.href = "/workspace";
			} catch (err) {
				console.error("Failed to set Supabase session", err);
			}
		};
		window.electron.onSupabaseLogin(handler);
	}, []);
}

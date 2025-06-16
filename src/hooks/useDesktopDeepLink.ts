import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function useDesktopDeepLink() {
	useEffect(() => {
		const checkAndRedirect = async () => {
			if (localStorage.getItem("schedulr_desktop_signup") !== "1") return;
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return;
			localStorage.removeItem("schedulr_desktop_signup");
			const deepLink = `schedulr://auth?access_token=${encodeURIComponent(
				session.access_token
			)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
			window.location.href = deepLink;
		};

		checkAndRedirect();
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, _session) => {
			checkAndRedirect();
		});
		return () => {
			subscription?.unsubscribe();
		};
	}, []);
}

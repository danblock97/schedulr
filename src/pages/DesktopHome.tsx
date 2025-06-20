import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

/**
 * DesktopHome is only used in the Electron build of the app.
 * It replaces the marketing homepage so that desktop users go
 * straight to their workspace dashboard when logged-in, or to
 * the auth flow when they are not.
 */
const DesktopHome: React.FC = () => {
	const [session, setSession] = useState<Session | null | undefined>(undefined);

	useEffect(() => {
		// Check the current session first
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		// Keep the component in sync with future auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Still determining the auth state – show nothing for a split second.
	if (session === undefined) {
		return null;
	}

	// Authenticated users land on the dashboard view of their workspace.
	if (session) {
		return <Navigate to="/workspace?view=dashboard" replace />;
	}

	// Unauthenticated users are taken to the login screen.
	return <Navigate to="/auth?mode=login" replace />;
};

export default DesktopHome;

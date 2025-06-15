import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const ProtectedRoute: React.FC = () => {
	const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined initially to represent loading state
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session: currentSession },
			} = await supabase.auth.getSession();
			setSession(currentSession);
			setIsLoading(false);
		};

		fetchSession();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, currentSession) => {
				setSession(currentSession);
				// No need to setIsLoading here as initial load is handled by fetchSession
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	if (isLoading) {
		// You can replace this with a proper loading spinner component
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>Loading...</p>
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/auth?mode=login" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;

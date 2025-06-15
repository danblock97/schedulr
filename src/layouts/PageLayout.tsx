import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const PageLayout: React.FC = () => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoadingAuth, setIsLoadingAuth] = useState(true);

	useEffect(() => {
		const fetchUserAndProfile = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setCurrentUser(user);
			if (user) {
				const { data: profileData } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single();
				setProfile(profileData);
			}
			setIsLoadingAuth(false);
		};
		fetchUserAndProfile();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			const user = session?.user ?? null;
			setCurrentUser(user);
			if (user) {
				supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single()
					.then(({ data }) => setProfile(data));
			} else {
				setProfile(null);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const userForHeader = currentUser
		? ({
				...currentUser,
				user_metadata: {
					...currentUser.user_metadata,
					username: profile?.username || currentUser.user_metadata.username,
					avatar_url:
						profile?.avatar_url || currentUser.user_metadata.avatar_url,
				},
		  } as User)
		: null;

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<WorkspaceHeader currentUser={userForHeader} withSidebar={false} />
			<main className="flex-1">
				{isLoadingAuth ? (
					<div className="flex items-center justify-center flex-1">
						Loading...
					</div>
				) : (
					<Outlet context={{ user: currentUser }} />
				)}
			</main>
		</div>
	);
};

export default PageLayout;

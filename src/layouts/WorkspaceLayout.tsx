import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { useToast } from "@/components/ui/use-toast";

type Profile = Tables<"profiles">;

const WorkspaceLayout: React.FC = () => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoadingAuth, setIsLoadingAuth] = useState(true);
	const { toast } = useToast();

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

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const handleCompleteOnboarding = async () => {
		if (!currentUser) return;

		// Optimistically update local state for a smoother experience
		setProfile((prevProfile) => {
			if (!prevProfile) return null;
			return { ...prevProfile, has_completed_onboarding: true };
		});

		const { error } = await supabase
			.from("profiles")
			.update({ has_completed_onboarding: true })
			.eq("id", currentUser.id);

		if (error) {
			console.error("Error updating onboarding status:", error);
			toast({
				title: "Error",
				description:
					"Could not save your tour preference. It might show again.",
				variant: "destructive",
			});
			// Revert optimistic update on error
			setProfile((prevProfile) => {
				if (!prevProfile) return null;
				return { ...prevProfile, has_completed_onboarding: false };
			});
		}
	};

	if (isLoadingAuth) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-black">
				Loading user data...
			</div>
		);
	}

	const userForHeader = currentUser
		? ({
				...currentUser,
				user_metadata: {
					...currentUser.user_metadata,
					username: profile?.username || currentUser?.user_metadata?.username,
					avatar_url:
						profile?.avatar_url || currentUser?.user_metadata?.avatar_url,
				},
		  } as User)
		: null;

	const workspaceInfo = profile
		? {
				name: profile.workspace_name,
				iconUrl: profile.workspace_icon_url,
		  }
		: null;

	return (
		<SidebarProvider defaultOpen>
			<OnboardingTour
				showTour={profile ? !profile.has_completed_onboarding : false}
				onComplete={handleCompleteOnboarding}
			/>
			<AppSidebar />
			<SidebarInset className="flex flex-col min-h-screen min-w-0">
				<WorkspaceHeader
					currentUser={userForHeader}
					withSidebar={true}
					workspaceInfo={workspaceInfo}
				/>
				<div className="flex-1 overflow-hidden bg-muted/20">
					<Outlet context={{ user: userForHeader, profile }} />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default WorkspaceLayout;

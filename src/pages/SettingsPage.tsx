import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsDialog from "@/components/settings/SettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const SettingsPage = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			setIsLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				const { data: profileData, error } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single();

				if (error && error.code !== "PGRST116") {
					// Ignore "No rows found" error
					console.error("Error fetching profile:", error);
				} else {
					setProfile(profileData);
				}
			}
			setIsLoading(false);
		};
		fetchUserData();
	}, []);

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			navigate("/workspace");
		}
	};

	if (isLoading) {
		return <div className="p-6">Loading settings...</div>;
	}

	return (
		<SettingsDialog
			open={true}
			onOpenChange={handleOpenChange}
			user={user}
			profile={profile}
		/>
	);
};

export default SettingsPage;

import React from "react";
import PageList from "@/components/PageList";
import TrashList from "@/components/TrashList";
import { useOutletContext, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import Dashboard from "@/components/dashboard/Dashboard";

interface WorkspaceContext {
	user: User;
}

const WorkspacePage = () => {
	const { user: currentUser } = useOutletContext<WorkspaceContext>();
	const [searchParams] = useSearchParams();
	const view = searchParams.get("view");

	if (!currentUser) {
		return null; // The layout will show a loading state
	}

	const renderContent = () => {
		switch (view) {
			case "dashboard":
				return <Dashboard user={currentUser} />;
			case "pages":
				return <PageList userId={currentUser.id} />;
			case "trash":
				return <TrashList userId={currentUser.id} />;
			default:
				return <Dashboard user={currentUser} />;
		}
	};

	return <div className="p-4 md:p-6">{renderContent()}</div>;
};

export default WorkspacePage;

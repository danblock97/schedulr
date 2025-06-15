import React from "react";
import type { Tables } from "@/integrations/supabase/types";
import { FileText, List, BarChart2, Calendar, Kanban } from "lucide-react";

interface PageIconProps {
	type: Tables<"pages">["type"];
	className?: string;
}

const PageIcon: React.FC<PageIconProps> = ({ type, className }) => {
	const iconProps = { className: className || "h-6 w-6 text-muted-foreground" };
	switch (type) {
		case "DOCUMENT":
			return <FileText {...iconProps} />;
		case "LIST":
			return <List {...iconProps} />;
		case "CHART":
			return <BarChart2 {...iconProps} />;
		case "CALENDAR":
			return <Calendar {...iconProps} />;
		case "KANBAN":
			return <Kanban {...iconProps} />;
		default:
			return <FileText {...iconProps} />;
	}
};

export default PageIcon;

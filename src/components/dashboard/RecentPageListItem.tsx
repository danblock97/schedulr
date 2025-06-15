import React from "react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import PageIcon from "./PageIcon";
import { formatDistanceToNow } from "date-fns";

interface RecentPageListItemProps {
	page: Tables<"pages">;
}

const RecentPageListItem: React.FC<RecentPageListItemProps> = ({ page }) => {
	const lastModified = formatDistanceToNow(new Date(page.last_modified_at), {
		addSuffix: true,
	});

	return (
		<Link to={`/workspace/page/${page.id}`} className="block">
			<div className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
				<PageIcon
					type={page.type}
					className="h-5 w-5 mr-4 flex-shrink-0 text-muted-foreground"
				/>
				<div className="flex-1 truncate mr-4">
					<p className="font-medium truncate">{page.title}</p>
				</div>
				<p className="text-sm text-muted-foreground ml-auto whitespace-nowrap">
					Edited {lastModified}
				</p>
			</div>
		</Link>
	);
};

export default RecentPageListItem;

import React from "react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import PageIcon from "./PageIcon";

interface PageCardProps {
	page: Tables<"pages">;
}

const PageCard: React.FC<PageCardProps> = ({ page }) => {
	return (
		<Link to={`/workspace/page/${page.id}`} className="block">
			<Card className="bg-muted/20 border-0 hover:bg-muted/40 transition-all duration-300 hover:scale-105 h-28 flex flex-col justify-center">
				<CardHeader className="p-4">
					<PageIcon type={page.type} className="h-6 w-6 mb-2" />
					<CardTitle className="text-sm font-medium mt-1 truncate">
						{page.title}
					</CardTitle>
				</CardHeader>
			</Card>
		</Link>
	);
};

export default PageCard;

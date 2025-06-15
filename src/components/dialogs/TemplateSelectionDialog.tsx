import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import PageIcon from "@/components/dashboard/PageIcon";

// Defining and exporting a simple PageType to avoid deep type instantiation issues.
export type PageType = "DOCUMENT" | "KANBAN" | "CHART" | "CALENDAR" | "LIST";

// Define a simplified Json type. Using `any` to avoid deep type instantiation errors.
export type SimpleJson = any;

// Local type to reflect the database schema. `template_content` is now a string.
// The `type` property is removed as it's not in the official Supabase types for this table
// and is not used within this component's render logic. The filtering by type happens
// in the query itself.
type PageTemplate = {
	id: string;
	created_at: string;
	name: string;
	description: string | null;
	// This is now a string representation of JSON, which needs to be parsed.
	template_content: string;
};

interface TemplateSelectionDialogProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	pageType: PageType;
	onCreate: (title: string, content: SimpleJson) => void;
}

const fetchPageTemplates = async (
	pageType: PageType
): Promise<PageTemplate[]> => {
	// We are now using the RPC function to avoid Supabase's deep type instantiation issues.
	const { data, error } = await supabase.rpc("get_page_templates_by_type", {
		p_type: pageType,
	});

	if (error) throw new Error(error.message);

	// The RPC function returns data in the correct shape, simplifying the client.
	return data || [];
};

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
	isOpen,
	onOpenChange,
	pageType,
	onCreate,
}) => {
	const { data: templates, isLoading } = useQuery({
		queryKey: ["page_templates", pageType],
		queryFn: () => fetchPageTemplates(pageType),
		enabled: isOpen && !!pageType,
	});

	const filteredTemplates = templates?.filter((template) => {
		const lowerCaseName = template.name.toLowerCase();
		if (lowerCaseName.includes("blank")) {
			return false;
		}
		if (
			pageType === "DOCUMENT" &&
			(lowerCaseName.includes("to-do") || lowerCaseName.includes("todo"))
		) {
			return false;
		}
		return true;
	});

	const handleSelectTemplate = (template: PageTemplate) => {
		let content: SimpleJson = null;
		try {
			// The template content is stored as a string, so we need to parse it.
			if (template.template_content) {
				content = JSON.parse(template.template_content);
			}
		} catch (e) {
			console.error("Error parsing template content:", e);
			// Proceed with a blank page if template is corrupted.
		}
		onCreate(template.name, content);
		onOpenChange(false);
	};

	const handleSelectBlank = () => {
		const typeName = pageType.charAt(0) + pageType.slice(1).toLowerCase();
		onCreate(`Untitled ${typeName}`, null);
		onOpenChange(false);
	};

	const pageTypeName = pageType
		? pageType.charAt(0) + pageType.slice(1).toLowerCase()
		: "";

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Create a new {pageTypeName}</DialogTitle>
					<DialogDescription>
						Start with a template or a blank page.
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-96 pr-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
						<Card
							className="cursor-pointer hover:bg-accent transition-colors"
							onClick={handleSelectBlank}
						>
							<CardHeader className="items-center text-center p-6">
								<PlusCircle className="h-10 w-10 text-muted-foreground mb-2" />
								<CardTitle className="text-lg">Blank {pageTypeName}</CardTitle>
								<CardDescription className="mt-1">
									Start from scratch.
								</CardDescription>
							</CardHeader>
						</Card>

						{isLoading &&
							Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-40 rounded-lg" />
							))}

						{filteredTemplates?.map((template) => (
							<Card
								key={template.id}
								className="cursor-pointer hover:bg-accent transition-colors"
								onClick={() => handleSelectTemplate(template)}
							>
								<CardHeader className="items-center text-center p-6">
									<PageIcon
										type={pageType}
										className="h-10 w-10 text-muted-foreground mb-2"
									/>
									<CardTitle className="text-lg">{template.name}</CardTitle>
									<CardDescription className="mt-1">
										{template.description}
									</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default TemplateSelectionDialog;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import Editor from "@/components/page-editor/Editor";
import EditorLoading from "@/components/page-editor/EditorLoading";
import EditorNotFound from "@/components/page-editor/EditorNotFound";
import KanbanEditor from "@/components/page-editor/KanbanEditor";
import ChartEditor from "@/components/page-editor/ChartEditor";
import CalendarEditor from "@/components/page-editor/CalendarEditor";
import ListEditor from "@/components/page-editor/ListEditor";

type Page = Tables<"pages">;

const PageEditorPage: React.FC = () => {
	const { pageId } = useParams<{ pageId: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [page, setPage] = useState<Tables<"pages"> | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!pageId) {
			navigate("/workspace");
			return;
		}

		const fetchPage = async () => {
			setIsLoading(true);
			setError(null);
			const { data, error: fetchError } = await supabase
				.from("pages")
				.select("*")
				.eq("id", pageId)
				.single();

			if (fetchError) {
				console.error("Error fetching page:", fetchError);
				toast({
					title: "Error",
					description: `Failed to load page: ${fetchError.message}`,
					variant: "destructive",
				});
				setPage(null);
				setError(fetchError.message);
			} else {
				setPage(data);
			}
			setIsLoading(false);
		};

		fetchPage();
	}, [pageId, navigate, toast]);

	if (isLoading) {
		return <EditorLoading message="Loading page editor..." />;
	}

	if (error || !page) {
		return <EditorNotFound error={error} />;
	}

	const renderEditor = () => {
		switch (page.type) {
			case "DOCUMENT":
				return <Editor pageData={page} onPageUpdate={setPage} />;
			case "KANBAN":
				return <KanbanEditor pageData={page} onPageUpdate={setPage} />;
			case "CHART":
				return <ChartEditor pageData={page} />;
			case "CALENDAR":
				return <CalendarEditor pageData={page} onPageUpdate={setPage} />;
			case "LIST":
				return <ListEditor pageData={page} onPageUpdate={setPage} />;
			default:
				// This is a safe fallback, but with TS enums, it should not be reached.
				return <EditorNotFound error={`Unknown page type: ${page.type}`} />;
		}
	};

	return renderEditor();
};

export default PageEditorPage;

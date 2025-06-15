import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { useBlockNote } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import { FileText } from "lucide-react";
import EditorHeader from "./EditorHeader";
import EditorContent from "./EditorContent";

type Page = Tables<"pages">;

const getInitialContent = (
	pageContent: Page["content"]
): PartialBlock[] | undefined => {
	if (!pageContent) {
		return undefined;
	}
	try {
		if (Array.isArray(pageContent) && pageContent.length > 0) {
			return pageContent as PartialBlock[];
		}
		if (typeof pageContent === "string" && pageContent.trim().startsWith("[")) {
			const parsed = JSON.parse(pageContent);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed as PartialBlock[];
			}
		}
	} catch (e) {
		console.error("Failed to parse page content for editor", e);
	}
	return undefined;
};

interface EditorProps {
	pageData: Page;
	onPageUpdate: (page: Page) => void;
}

const Editor: React.FC<EditorProps> = ({ pageData, onPageUpdate }) => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [title, setTitle] = useState(pageData.title || "Untitled");
	const [content, setContent] = useState<PartialBlock[]>([]);
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [savingStatus, setSavingStatus] = useState<
		"idle" | "unsaved" | "saving"
	>("idle");
	const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
	const isMounted = useRef(false);

	const editor = useBlockNote(
		{
			// initialContent is only used on first render of the hook,
			// which was causing issues with re-renders.
			// Content is now loaded via useEffect.
		},
		[pageData.id]
	);

	useEffect(() => {
		setTitle(pageData.title || "Untitled");
		const newContent = getInitialContent(pageData.content);
		if (editor) {
			// This is a workaround to force update the editor content when pageData changes
			// as initialContent is only used on first render.
			const currentEditorContent = JSON.stringify(editor.document);
			const newPageContent = JSON.stringify(newContent);
			if (currentEditorContent !== newPageContent) {
				editor.replaceBlocks(editor.document, newContent || []);
			}
		}
		setContent(newContent || []);
		setSavingStatus("idle");
		isMounted.current = false; // Reset for the new page
	}, [pageData, editor]);

	useEffect(() => {
		const detectTheme = () => {
			setCurrentTheme(
				document.documentElement.classList.contains("dark") ? "dark" : "light"
			);
		};
		detectTheme();
		const observer = new MutationObserver(detectTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	const savePage = async () => {
		if (!editor) return;
		setSavingStatus("saving");
		const contentToSave = editor.document;

		const { data: updatedPageData, error: supabaseError } = await supabase
			.from("pages")
			.update({
				title,
				content: contentToSave as any,
				last_modified_at: new Date().toISOString(),
			})
			.eq("id", pageData.id)
			.select()
			.single();

		if (supabaseError) {
			toast({
				title: "Save Failed",
				description: supabaseError.message,
				variant: "destructive",
			});
			setSavingStatus("unsaved");
		} else if (updatedPageData) {
			onPageUpdate(updatedPageData);
			toast({
				title: "Page Saved",
				description: `Your changes have been saved.`,
			});
			setSavingStatus("idle");
		}
	};

	// Auto-save effect
	useEffect(() => {
		if (!isMounted.current) {
			isMounted.current = true;
			return;
		}

		const originalContent = JSON.stringify(getInitialContent(pageData.content));
		const currentContent = JSON.stringify(content);
		const hasChanged =
			title !== pageData.title || currentContent !== originalContent;

		if (hasChanged) {
			setSavingStatus("unsaved");
			const timer = setTimeout(() => {
				savePage();
			}, 2000); // 2-second delay

			return () => clearTimeout(timer);
		}
	}, [title, content, pageData]);

	const handleDelete = async () => {
		if (
			!window.confirm(
				`Are you sure you want to move "${pageData.title}" to the trash?`
			)
		) {
			return;
		}
		const { error } = await supabase
			.from("pages")
			.update({ trashed_at: new Date().toISOString() })
			.eq("id", pageData.id);

		if (error) {
			toast({
				title: "Move to Trash Failed",
				description: error.message,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Page Moved to Trash",
				description: `"${pageData.title}" has been moved to trash.`,
			});
			navigate("/workspace");
		}
	};

	if (!editor) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
				<div className="animate-pulse text-muted-foreground">
					<FileText className="h-12 w-12 mx-auto mb-2" />
					Initializing editor...
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<EditorHeader
				title={title}
				setTitle={setTitle}
				isEditingTitle={isEditingTitle}
				setIsEditingTitle={setIsEditingTitle}
				savingStatus={savingStatus}
				handleDelete={handleDelete}
				lastModifiedAt={pageData.last_modified_at}
			/>
			<EditorContent
				editor={editor}
				theme={currentTheme}
				onContentChange={() => setContent(editor.document)}
			/>
		</div>
	);
};

export default Editor;

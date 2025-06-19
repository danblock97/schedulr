import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import PageIcon from "./PageIcon";
import { Calendar, ListTodo, KanbanSquare, FileText } from "lucide-react";

type SearchHit = {
	entity_id: string;
	entity_type: "page" | "kanban_task" | "list_item" | "calendar_event";
	title: string;
	snippet: string | null;
	page_id: string;
};

const iconFor = (type: SearchHit["entity_type"] | Tables<"pages">["type"]) => {
	if (type === "KANBAN" || type === "kanban_task")
		return <KanbanSquare className="h-5 w-5" />;
	if (type === "CALENDAR" || type === "calendar_event")
		return <Calendar className="h-5 w-5" />;
	if (type === "LIST" || type === "list_item")
		return <ListTodo className="h-5 w-5" />;
	return <FileText className="h-5 w-5" />;
};

const cleanSnippet = (s: string) => {
	// try to show highlighted part first
	const match = s.match(/<b>(.*?)<\/b>/i);
	if (match && match[1]) return match[1];
	let cleaned = s;
	cleaned = cleaned.replace(/<[^>]+>/g, ""); // strip html
	cleaned = cleaned.replace(/[\{\}\"\[\]]/g, "");
	cleaned = cleaned.replace(
		/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
		""
	);
	cleaned = cleaned.replace(
		/\b(id|type|props|styles|cells|backgroundColor|textColor|textAlignment):[^,]+,?/gi,
		""
	);
	cleaned = cleaned.replace(/\s+/g, " ").trim();
	return cleaned.length > 120 ? cleaned.slice(0, 117) + "…" : cleaned;
};

const WorkspaceSearch = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<SearchHit[]>([]);
	const [isFocused, setIsFocused] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const searchContainerRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const handler = setTimeout(async () => {
			if (searchTerm.trim().length > 1) {
				setIsLoading(true);
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					const { data, error } = (await supabase.rpc(
						"search_workspace" as any,
						{
							p_user_id: user.id,
							p_query: searchTerm,
						}
					)) as unknown as { data: SearchHit[] | null; error: any };

					if (error) {
						console.error("Error searching workspace:", error);
						setResults([]);
					} else {
						setResults(data || []);
					}
				}
				setIsLoading(false);
			} else {
				setResults([]);
			}
		}, 300); // 300ms debounce

		return () => {
			clearTimeout(handler);
		};
	}, [searchTerm]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(event.target as Node)
			) {
				setIsFocused(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSelect = (pageId: string) => {
		navigate(`/workspace/page/${pageId}`);
		setSearchTerm("");
		setResults([]);
		setIsFocused(false);
	};

	return (
		<div className="relative" ref={searchContainerRef}>
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
			<Input
				placeholder="Ask or find anything from your workspace..."
				className="pl-10 h-12 text-base bg-muted/20 border-0 focus-visible:ring-1 focus-visible:ring-primary"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				onFocus={() => setIsFocused(true)}
			/>
			{isFocused && searchTerm.length > 0 && (
				<div className="absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
					{isLoading ? (
						<div className="p-3 space-y-2">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-6 w-2/3" />
						</div>
					) : results.length > 0 ? (
						<ul className="py-1">
							{results.map((hit) => (
								<li key={hit.entity_id}>
									<button
										onClick={() => handleSelect(hit.page_id)}
										className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-muted"
									>
										<span className="text-muted-foreground flex-shrink-0">
											{iconFor(hit.entity_type)}
										</span>
										<div className="flex flex-col text-left">
											<span className="truncate font-medium">{hit.title}</span>
											{hit.snippet && (
												<span
													className="text-xs text-muted-foreground truncate"
													dangerouslySetInnerHTML={{
														__html: cleanSnippet(hit.snippet),
													}}
												/>
											)}
										</div>
									</button>
								</li>
							))}
						</ul>
					) : (
						<p className="p-4 text-sm text-muted-foreground">
							No results found for "{searchTerm}".
						</p>
					)}
				</div>
			)}
			{/* TODO: Add filter buttons and actions as seen in the reference image */}
		</div>
	);
};

export default WorkspaceSearch;

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import PageIcon from "./PageIcon";

const WorkspaceSearch = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<
		Pick<Tables<"pages">, "id" | "title" | "type">[]
	>([]);
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
					const { data, error } = await supabase
						.from("pages")
						.select("id, title, type")
						.eq("user_id", user.id)
						.ilike("title", `%${searchTerm}%`)
						.is("trashed_at", null)
						.limit(5);

					if (error) {
						console.error("Error searching pages:", error);
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
							{results.map((page) => (
								<li key={page.id}>
									<button
										onClick={() => handleSelect(page.id)}
										className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-muted"
									>
										<PageIcon
											type={page.type}
											className="h-5 w-5 text-muted-foreground flex-shrink-0"
										/>
										<span className="truncate">{page.title}</span>
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

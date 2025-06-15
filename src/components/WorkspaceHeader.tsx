import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Search, Sun, Moon, Settings, LogOut } from "lucide-react";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import PageIcon from "@/components/dashboard/PageIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { applyTheme } from "@/lib/theme";
import Logo from "@/components/Logo";

interface WorkspaceHeaderProps {
	currentUser: User | null;
	withSidebar?: boolean;
	workspaceInfo?: { name: string | null; iconUrl: string | null } | null;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
	currentUser,
	withSidebar = false,
	workspaceInfo,
}) => {
	const navigate = useNavigate();
	const { toast } = useToast();
	// Basic theme toggle - for full functionality, integrate with a theme provider like next-themes
	const [isDarkMode, setIsDarkMode] = React.useState(
		document.documentElement.classList.contains("dark")
	);

	// Search state
	const [searchTerm, setSearchTerm] = React.useState("");
	const [searchResults, setSearchResults] = React.useState<
		Pick<Tables<"pages">, "id" | "title" | "type">[]
	>([]);
	const [isSearchFocused, setIsSearchFocused] = React.useState(false);
	const [isSearchLoading, setIsSearchLoading] = React.useState(false);
	const searchContainerRef = React.useRef<HTMLDivElement>(null);

	const toggleTheme = async () => {
		const newTheme = document.documentElement.classList.contains("dark")
			? "light"
			: "dark";
		applyTheme(newTheme);
		setIsDarkMode(newTheme === "dark");

		if (currentUser) {
			const { error } = await supabase
				.from("profiles")
				.update({ theme: newTheme })
				.eq("id", currentUser.id);

			if (error) {
				toast({
					title: "Error",
					description: "Could not save theme preference.",
					variant: "destructive",
				});
			}
		}
	};

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			toast({
				title: "Logout Failed",
				description: error.message,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Logged Out",
				description: "You have been successfully logged out.",
			});
			navigate("/");
		}
	};

	const getInitials = (email?: string) => {
		if (!email) return "U";
		const parts = email.split("@")[0].split(/[._-]/);
		if (parts.length > 1) {
			return (parts[0][0] + parts[1][0]).toUpperCase();
		}
		return email.substring(0, 2).toUpperCase();
	};

	const username =
		currentUser?.user_metadata?.username || currentUser?.email?.split("@")[0];

	React.useEffect(() => {
		const handler = setTimeout(async () => {
			if (searchTerm.trim().length > 1 && currentUser) {
				setIsSearchLoading(true);
				const { data, error } = await supabase
					.from("pages")
					.select("id, title, type")
					.eq("user_id", currentUser.id)
					.ilike("title", `%${searchTerm}%`)
					.is("trashed_at", null)
					.limit(5);

				if (error) {
					console.error("Error searching pages:", error);
					setSearchResults([]);
				} else {
					setSearchResults(data || []);
				}
				setIsSearchLoading(false);
			} else {
				setSearchResults([]);
			}
		}, 300); // 300ms debounce

		return () => {
			clearTimeout(handler);
		};
	}, [searchTerm, currentUser]);

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(event.target as Node)
			) {
				setIsSearchFocused(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	React.useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDarkMode(document.documentElement.classList.contains("dark"));
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	const handleSelectSearchResult = (pageId: string) => {
		navigate(`/workspace/page/${pageId}`);
		setSearchTerm("");
		setSearchResults([]);
		setIsSearchFocused(false);
	};

	return (
		<header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 justify-between">
			<div className="flex items-center gap-4">
				{withSidebar && (
					<div className="md:hidden">
						<SidebarTrigger />
					</div>
				)}
				<Link
					to="/workspace"
					className="flex items-center gap-2 font-bold text-lg mr-4"
				>
					{workspaceInfo?.iconUrl ? (
						<Avatar className="h-7 w-7">
							<AvatarImage
								src={workspaceInfo.iconUrl}
								alt={workspaceInfo.name || "Workspace"}
							/>
							<AvatarFallback>
								<Logo className="h-4 w-4" />
							</AvatarFallback>
						</Avatar>
					) : (
						<Logo className="h-5 w-5" />
					)}
					<span className="hidden sm:inline-block truncate">
						{workspaceInfo?.name || "Schedulr"}
					</span>
				</Link>
				<NavigationMenu className="hidden md:flex">
					<NavigationMenuList>
						{currentUser && (
							<NavigationMenuItem>
								<Link to="/workspace" className={navigationMenuTriggerStyle()}>
									Dashboard
								</Link>
							</NavigationMenuItem>
						)}
						<NavigationMenuItem>
							<Link to="/" className={navigationMenuTriggerStyle()}>
								Home
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<Link to="/pricing" className={navigationMenuTriggerStyle()}>
								Pricing
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<Link to="/contact" className={navigationMenuTriggerStyle()}>
								Contact
							</Link>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>

			<div className="flex items-center gap-2 md:gap-4">
				<div className="relative flex-1 max-w-xs" ref={searchContainerRef}>
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search..."
						className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onFocus={() => setIsSearchFocused(true)}
						disabled={!currentUser}
					/>
					{isSearchFocused && currentUser && searchTerm.length > 0 && (
						<div className="absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
							{isSearchLoading ? (
								<div className="p-2 space-y-1">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-5 w-2/3" />
								</div>
							) : searchResults.length > 0 ? (
								<ul className="py-1">
									{searchResults.map((page) => (
										<li key={page.id}>
											<button
												onClick={() => handleSelectSearchResult(page.id)}
												className="w-full text-left flex items-center gap-2 px-2 py-1.5 hover:bg-muted text-sm"
											>
												<PageIcon
													type={page.type}
													className="h-4 w-4 text-muted-foreground flex-shrink-0"
												/>
												<span className="truncate">{page.title}</span>
											</button>
										</li>
									))}
								</ul>
							) : (
								<p className="p-2 text-sm text-muted-foreground">
									No results for "{searchTerm}".
								</p>
							)}
						</div>
					)}
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleTheme}
					aria-label="Toggle theme"
				>
					{isDarkMode ? (
						<Sun className="h-5 w-5" />
					) : (
						<Moon className="h-5 w-5" />
					)}
				</Button>
				{currentUser && <NotificationsBell user={currentUser} />}
				{currentUser ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={currentUser.user_metadata?.avatar_url}
										alt={username || "User"}
									/>
									<AvatarFallback>
										{getInitials(currentUser.email)}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">{username}</p>
									<p className="text-xs leading-none text-muted-foreground">
										{currentUser.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => navigate("/settings")}>
								<Settings className="mr-2 h-4 w-4" />
								<span>Settings</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<div className="flex items-center gap-2">
						<Button asChild variant="ghost">
							<Link to="/auth?mode=login">Log In</Link>
						</Button>
						<Button asChild>
							<Link to="/auth?mode=signup">Sign Up</Link>
						</Button>
					</div>
				)}
			</div>
		</header>
	);
};

export default WorkspaceHeader;

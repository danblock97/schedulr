import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarSeparator,
	SidebarGroup,
	SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Home,
	FileText,
	Trash2,
	PlusCircle,
	Settings,
	LogOut,
	KanbanSquare,
	Calendar,
	ListTodo,
	Briefcase,
	Coffee,
	LifeBuoy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createNewPage } from "@/lib/pageActions";
import TemplateSelectionDialog, {
	PageType,
	SimpleJson,
} from "./dialogs/TemplateSelectionDialog";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import SettingsDialog from "@/components/settings/SettingsDialog";
import ContactDialog from "@/components/dialogs/ContactDialog";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import PageIcon from "@/components/dashboard/PageIcon";

const AppSidebar = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [templateDialogState, setTemplateDialogState] = useState<{
		isOpen: boolean;
		pageType: PageType | null;
	}>({ isOpen: false, pageType: null });

	const isMobile = useIsMobile();

	// Settings dialog state and auth data
	const [showSettings, setShowSettings] = useState(false);
	const [showContact, setShowContact] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);

	const location = useLocation();

	// Fetch user's pages
	const { data: privatePages } = useQuery({
		queryKey: ["sidebar_pages", currentUser?.id],
		enabled: !!currentUser?.id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("pages")
				.select("id,title,type")
				.eq("user_id", currentUser!.id)
				.is("trashed_at", null)
				.order("last_modified_at", { ascending: false });
			if (error) throw error;
			return data as { id: string; title: string | null; type: string }[];
		},
	});

	// Determine active sidebar menu
	const searchParams = new URLSearchParams(location.search);
	const viewParam = searchParams.get("view");
	const isDashboardActive = location.pathname === "/workspace" && !viewParam;
	const isPagesActive = viewParam === "pages";
	const isTrashActive = viewParam === "trash";

	useEffect(() => {
		const fetchAuth = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setCurrentUser(user);
			if (user) {
				const { data } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single();
				setProfile(data);
			}
		};
		fetchAuth();
	}, []);

	const handleCreatePageFromTemplate = async (
		title: string,
		content: SimpleJson
	) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user || !templateDialogState.pageType) return;

		const newPageId = await createNewPage(
			user,
			templateDialogState.pageType,
			title,
			content
		);
		if (newPageId) {
			navigate(`/workspace/page/${newPageId}`);
		}
	};

	const openTemplateDialog = (pageType: PageType) => {
		setTemplateDialogState({ isOpen: true, pageType });
	};

	const handleCreateWorkspace = () => {
		toast({
			title: "Coming Soon!",
			description: "The ability to create multiple workspaces is on its way.",
		});
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

	return (
		<>
			<Sidebar collapsible="icon" className="border-r">
				<SidebarHeader className="p-2">
					<Button
						variant="ghost"
						className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto"
						asChild
					>
						<Link to="/" className="flex items-center gap-2">
							<Logo className="h-6 w-6" />
							<span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
								Schedulr
							</span>
						</Link>
					</Button>
				</SidebarHeader>
				<SidebarSeparator />
				<SidebarContent className="p-2">
					<ScrollArea className="h-full">
						<SidebarMenu>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton tooltip="New..." className="w-full">
										<PlusCircle className="h-5 w-5" />
										<span className="group-data-[collapsible=icon]:hidden">
											New...
										</span>
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									side={isMobile ? "bottom" : "right"}
									align={isMobile ? "center" : "start"}
									className={`w-full sm:w-56 ${isMobile ? "max-w-[90vw]" : ""}`}
								>
									<DropdownMenuLabel>Create new</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleCreateWorkspace}>
										<Briefcase className="mr-2 h-4 w-4" />
										<span>New Workspace</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => openTemplateDialog("DOCUMENT")}
									>
										<FileText className="mr-2 h-4 w-4" />
										<span>New Document</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => openTemplateDialog("KANBAN")}
									>
										<KanbanSquare className="mr-2 h-4 w-4" />
										<span>New Kanban Board</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => openTemplateDialog("CALENDAR")}
									>
										<Calendar className="mr-2 h-4 w-4" />
										<span>New Calendar</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => openTemplateDialog("LIST")}>
										<ListTodo className="mr-2 h-4 w-4" />
										<span>New List</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenu>
						<SidebarGroup className="mt-2">
							<SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
								Workspace
							</SidebarGroupLabel>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										tooltip="Dashboard"
										isActive={isDashboardActive}
									>
										<Link to="/workspace">
											<Home className="h-5 w-5" />
											<span className="group-data-[collapsible=icon]:hidden">
												Dashboard
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										tooltip="All Pages"
										isActive={isPagesActive}
									>
										<Link to="/workspace?view=pages">
											<FileText className="h-5 w-5" />
											<span className="group-data-[collapsible=icon]:hidden">
												All Pages
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										tooltip="Trash"
										isActive={isTrashActive}
									>
										<Link to="/workspace?view=trash">
											<Trash2 className="h-5 w-5" />
											<span className="group-data-[collapsible=icon]:hidden">
												Trash
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroup>
						{privatePages && privatePages.length > 0 && (
							<SidebarGroup className="mt-4">
								<SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
									Private
								</SidebarGroupLabel>
								<SidebarMenu>
									{privatePages.map((page) => (
										<SidebarMenuItem key={page.id}>
											<SidebarMenuButton
												asChild
												tooltip={page.title || "Untitled"}
												isActive={
													location.pathname === `/workspace/page/${page.id}`
												}
											>
												<Link to={`/workspace/page/${page.id}`}>
													<PageIcon
														type={page.type as any}
														className="h-5 w-5"
													/>
													<span className="group-data-[collapsible=icon]:hidden truncate">
														{page.title || "Untitled"}
													</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroup>
						)}
					</ScrollArea>
				</SidebarContent>
				<SidebarSeparator />
				<SidebarFooter className="p-2">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={() => setShowSettings(true)}
								tooltip="Settings"
							>
								<Settings className="h-5 w-5" />
								<span className="group-data-[collapsible=icon]:hidden">
									Settings
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={() =>
									window.open("https://coff.ee/danblock97", "_blank")
								}
								tooltip="Buy me a coffee"
							>
								<Coffee className="h-5 w-5" />
								<span className="group-data-[collapsible=icon]:hidden">
									Buy me a coffee
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={() => setShowContact(true)}
								tooltip="Help Center"
							>
								<LifeBuoy className="h-5 w-5" />
								<span className="group-data-[collapsible=icon]:hidden">
									Help Center
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
								<LogOut className="h-5 w-5" />
								<span className="group-data-[collapsible=icon]:hidden">
									Log Out
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
			{templateDialogState.pageType && (
				<TemplateSelectionDialog
					isOpen={templateDialogState.isOpen}
					onOpenChange={(isOpen) =>
						setTemplateDialogState((prev) => ({ ...prev, isOpen }))
					}
					pageType={templateDialogState.pageType}
					onCreate={handleCreatePageFromTemplate}
				/>
			)}
			{/* Settings modal */}
			<SettingsDialog
				open={showSettings}
				onOpenChange={setShowSettings}
				user={currentUser}
				profile={profile}
			/>
			<ContactDialog open={showContact} onOpenChange={setShowContact} />
		</>
	);
};

export default AppSidebar;

import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createNewPage } from "@/lib/pageActions";
import TemplateSelectionDialog, {
	PageType,
	SimpleJson,
} from "./dialogs/TemplateSelectionDialog";

const AppSidebar = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [templateDialogState, setTemplateDialogState] = useState<{
		isOpen: boolean;
		pageType: PageType | null;
	}>({ isOpen: false, pageType: null });

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
							<img src="/favicon.ico" alt="Schedulr Logo" className="h-6 w-6" />
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
									side="right"
									align="start"
									className="w-56"
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
									<SidebarMenuButton asChild tooltip="Dashboard">
										<Link to="/workspace">
											<Home className="h-5 w-5" />
											<span className="group-data-[collapsible=icon]:hidden">
												Dashboard
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton asChild tooltip="All Pages">
										<Link to="/workspace?view=pages">
											<FileText className="h-5 w-5" />
											<span className="group-data-[collapsible=icon]:hidden">
												All Pages
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton asChild tooltip="Trash">
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
					</ScrollArea>
				</SidebarContent>
				<SidebarSeparator />
				<SidebarFooter className="p-2">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="Settings">
								<Link to="/settings">
									<Settings className="h-5 w-5" />
									<span className="group-data-[collapsible=icon]:hidden">
										Settings
									</span>
								</Link>
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
		</>
	);
};

export default AppSidebar;

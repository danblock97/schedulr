import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import type { Tables, Json } from "@/integrations/supabase/types";

export const createNewPage = async (
	currentUser: User | null,
	pageType: Tables<"pages">["type"],
	title: string,
	content: Json | null = null
): Promise<string | null> => {
	if (!currentUser) {
		toast({
			title: "Error",
			description: "You must be logged in to create a page.",
			variant: "destructive",
		});
		return null;
	}

	// Check if the user has reached the page limit
	const { count, error: countError } = await supabase
		.from("pages")
		.select("id", { count: "exact", head: true })
		.eq("user_id", currentUser.id)
		.is("trashed_at", null);

	if (countError) {
		toast({
			title: "Error",
			description: `Failed to check page count: ${countError.message}`,
			variant: "destructive",
		});
		return null;
	}

	if (count !== null && count >= 5) {
		toast({
			title: "Page Limit Reached",
			description:
				"You can only have up to 5 pages. Please delete an existing page to create a new one.",
			variant: "destructive",
		});
		return null;
	}

	const { data, error } = await supabase
		.from("pages")
		.insert({
			user_id: currentUser.id,
			title: title,
			type: pageType,
			content: content,
		})
		.select("id")
		.single();

	if (error) {
		toast({
			title: "Failed to create page",
			description: error.message,
			variant: "destructive",
		});
		return null;
	} else if (data) {
		toast({
			title: "Page Created",
			description: `"${title}" has been created.`,
		});
		return data.id;
	}
	return null;
};

export const trashPage = async (pageId: string): Promise<boolean> => {
	const { error } = await supabase
		.from("pages")
		.update({ trashed_at: new Date().toISOString() })
		.eq("id", pageId);

	if (error) {
		toast({
			title: "Failed to move page to trash",
			description: error.message,
			variant: "destructive",
		});
		return false;
	}

	toast({
		title: "Page moved to Trash",
		description: "You can restore it from the Trash section.",
	});
	return true;
};

export const restorePage = async (pageId: string): Promise<boolean> => {
	// First, get the user_id for the page.
	const { data: pageData, error: pageError } = await supabase
		.from("pages")
		.select("user_id")
		.eq("id", pageId)
		.single();

	if (pageError || !pageData) {
		toast({
			title: "Error fetching page details",
			description: pageError?.message || "Page not found.",
			variant: "destructive",
		});
		return false;
	}

	const { user_id } = pageData;

	// Then check page count for that user.
	const { count, error: countError } = await supabase
		.from("pages")
		.select("id", { count: "exact", head: true })
		.eq("user_id", user_id)
		.is("trashed_at", null);

	if (countError) {
		toast({
			title: "Error checking page limit",
			description: countError.message,
			variant: "destructive",
		});
		return false;
	}

	if (count !== null && count >= 5) {
		toast({
			title: "Page Limit Reached",
			description:
				"You can only have up to 5 active pages. Please delete another page before restoring this one.",
			variant: "destructive",
		});
		return false;
	}

	const { error } = await supabase
		.from("pages")
		.update({ trashed_at: null })
		.eq("id", pageId);

	if (error) {
		toast({
			title: "Failed to restore page",
			description: error.message,
			variant: "destructive",
		});
		return false;
	}

	toast({
		title: "Page Restored",
		description: "The page has been successfully restored.",
	});
	return true;
};

export const permanentlyDeletePage = async (
	pageId: string
): Promise<boolean> => {
	const { error } = await supabase.from("pages").delete().eq("id", pageId);

	if (error) {
		toast({
			title: "Failed to delete page",
			description: error.message,
			variant: "destructive",
		});
		return false;
	}

	toast({
		title: "Page Permanently Deleted",
		description: "The page has been removed forever.",
	});
	return true;
};

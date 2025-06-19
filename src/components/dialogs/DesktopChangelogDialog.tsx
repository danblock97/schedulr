import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CHANGELOG } from "@/pages/ChangelogPage";
import useIsElectron from "@/hooks/useIsElectron";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "schedulr_last_seen_version";

const DesktopChangelogDialog: React.FC = () => {
	const isElectron = useIsElectron();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!isElectron) return;
		const lastSeen = localStorage.getItem(STORAGE_KEY);
		const latestVersion = CHANGELOG[0]?.version ?? "";
		if (lastSeen !== latestVersion) {
			const timeout = setTimeout(() => {
				setOpen(true);
			}, 5000); // show after 5 seconds

			return () => clearTimeout(timeout);
		}
	}, [isElectron]);

	const handleClose = () => {
		localStorage.setItem(STORAGE_KEY, CHANGELOG[0]?.version ?? "");
		setOpen(false);
	};

	if (!isElectron) return null;

	const latest = CHANGELOG[0];
	// Extract the first real change item (prefixed with "- ") for concise display
	const firstChange =
		latest.changes
			.find((c) => c.trim().startsWith("-"))
			?.replace(/^\-\s*/, "") ?? "";
	const imageSrc = `${import.meta.env.BASE_URL}images/changelog-image.png`;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="fixed bottom-4 left-4 top-auto translate-x-0 translate-y-0 max-w-sm p-0 overflow-hidden border bg-background shadow-lg rounded-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full">
				<img
					src={imageSrc}
					alt="Changelog banner"
					className="w-full h-48 object-cover"
				/>
				<div className="p-6 space-y-5">
					<DialogHeader className="space-y-2">
						<div className="inline-flex items-center gap-2 text-primary">
							<Sparkles className="h-5 w-5" />
							<DialogTitle className="text-lg">
								What's new in v{latest.version}
							</DialogTitle>
						</div>
						<DialogDescription>{latest.summary}</DialogDescription>
					</DialogHeader>

					<div className="bg-muted/20 dark:bg-muted/10 rounded-md p-4">
						<p className="leading-relaxed">{firstChange}</p>
					</div>

					<DialogFooter className="pt-4 flex-col gap-2 sm:flex-row sm:justify-end">
						<Button
							asChild
							variant="outline"
							className="w-full sm:w-auto"
							onClick={handleClose}
						>
							<Link to="/changelog">View Full Changelog</Link>
						</Button>
						<Button className="w-full sm:w-auto" onClick={handleClose}>
							Got it!
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DesktopChangelogDialog;

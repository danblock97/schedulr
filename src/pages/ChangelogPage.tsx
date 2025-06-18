import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ChangelogEntry {
	version: string;
	date: string;
	summary: string;
	changes: string[];
}

// NOTE: Update this constant for every new release.
export const CHANGELOG: ChangelogEntry[] = [
	{
		version: __APP_VERSION__,
		date: new Date().toISOString().split("T")[0],
		summary: "Latest improvements and fixes.",
		changes: [
			// --- WEB & DESKTOP ---
			"WEB & DESKTOP",
			"- Adding comments to tasks on Kanban boards",
			"- Full-text & tag search",
			"- File attachments & rich media onto Kanban tasks only",
			"- Changelog page to hold all past and present updates",

			// --- DESKTOP ONLY ---
			"DESKTOP ONLY",
			"- Global Quick-Add (system-wide hotkey)",
			"- Tray icon & background sync",
			"- Auto-launch on login (toggle in Settings)",
			"- Drag-&-drop files from Explorer",
			"- In-app updater UI",
		],
	},
	// Add historical entries below. Keep the newest entry at the top.
];

const ChangelogPage: React.FC = () => {
	return (
		<div className="container mx-auto py-12 px-6 max-w-3xl">
			<h1 className="text-4xl font-bold mb-6 text-center">Changelog</h1>
			<p className="text-muted-foreground text-center mb-12">
				Stay up-to-date with the latest features, improvements, and bug fixes.
			</p>

			<div className="space-y-10">
				{CHANGELOG.map((entry) => (
					<Card key={entry.version} className="border-background/30">
						<CardHeader>
							<CardTitle className="flex items-center justify-between flex-wrap gap-2">
								<span>v{entry.version}</span>
								<span className="text-sm text-muted-foreground font-normal">
									{entry.date}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p>{entry.summary}</p>
							<Separator />
							<ul className="list-disc list-inside space-y-2">
								{entry.changes.map((change, idx) => (
									<li key={idx}>{change}</li>
								))}
							</ul>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="mt-12 text-center">
				<Link to="/" className="underline text-primary">
					Back to Home
				</Link>
			</div>
		</div>
	);
};

export default ChangelogPage;

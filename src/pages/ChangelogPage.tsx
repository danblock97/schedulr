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
			"- Format changelog modal better also only show the most recent change on modal",
			"- Add old updates to bigger changelog",
			"- Fixed an issue where Desktop App shows electron window with app on startup which shouldn't happen (see attached image)",
		],
	},
	{
		version: "1.0.4",
		date: "2025-06-19",
		summary: "Latest improvements and fixes.",
		changes: [
			"- Adding comments to tasks on Kanban boards",
			"- Full-text & tag search",
			"- File attachments & rich media onto Kanban tasks only",
			"- Changelog page to hold all past and present updates",
			"- Global Quick-Add (system-wide hotkey)",
			"- Tray icon & background sync",
			"- Auto-launch on login (toggle in Settings)",
			"- Drag-&-drop files from Explorer",
			"- In-app updater UI",
		],
	},
	{
		version: "1.0.3",
		date: "2025-06-18",
		summary: "Minor Improvements & Bug Fixes",
		changes: [
			"- Fix Feature Window (images not showing on desktop app production)",
			"- Can't view pricing, contact etc on mobile devices, clicking the logo takes me to /auth",
			"- Nav logo on mobile is squished",
		],
	},
	{
		version: "1.0.2",
		date: "2025-06-17",
		summary: "Minor Improvements & Bug Fixes",
		changes: [
			"- Add download link for Desktop App",
			"- Added a feature window of the application",
			"- Fix Issues Disappearing but still being there during kanban drag and drop",
			"- Fixed the BlockNoteEditor incorrectly displaying text formatting",
		],
	},
	{
		version: "1.0.1",
		date: "2025-06-16",
		summary:
			"Schedulr for Desktop is Here: Your Schedule, Now on the Big Screen!",
		changes: [
			"Get ready to conquer your day with the brand-new Schedulr desktop app! We've brought all the powerful scheduling features you love from the web to the convenience of your computer, empowering you to manage your time with greater focus and efficiency.",
			"",
			"Stop juggling multiple calendars and to-do lists. The Schedulr desktop experience offers a beautifully designed, intuitive interface that syncs seamlessly with your mobile app. Now you can effortlessly plan your projects, appointments, and daily tasks from a larger, more immersive workspace.",
			"",
			"Here's what's waiting for you in our first desktop release:",
			"",
			"- A Spacious, Unified Calendar: View your weeks and months at a glance, making long-term planning a breeze.",
			"- Effortless Task Management: Drag and drop tasks, set priorities, and create detailed to-do lists with ease.",
			"- Real-Time Syncing: Your schedule is always up-to-date across all your devices, ensuring you never miss a beat.",
			"- Focused Work Environment: Minimize distractions and get in the zone with a dedicated application for all your scheduling needs.",
			"- Quick-Add Functionality: Instantly capture new tasks and events as they come to mind, without breaking your workflow.",
			"",
			"We've built Schedulr for Desktop for our power users, the dreamers, and the doers. It's for anyone who wants to take their productivity to the next level.",
			"",
			"Ready to transform your workflow?",
			"",
			"Download the Schedulr desktop app today from our website and start experiencing a more organized and productive life. We're incredibly excited for you to try it and can't wait to hear what you think!",
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

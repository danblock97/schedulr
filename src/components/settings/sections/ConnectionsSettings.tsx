import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Github, Slack } from "lucide-react";

const GoogleIcon = ({ className }: { className?: string }) => (
	<svg
		role="img"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<title>Google</title>
		<path
			d="M12.48 10.92v3.28h7.84c-.24 1.54-.64 2.73-1.21 3.73-.86 1.54-2.25 2.93-4.5 2.93-3.77 0-6.8-2.93-6.8-6.55 0-3.62 3.03-6.55 6.8-6.55 2.08 0 3.47.8 4.25 1.54l2.84-2.73C18.44 2.14 15.86 1 12.48 1 5.8 1 1 5.96 1 12.4s4.8 11.4 11.48 11.4c6.48 0 10.9-4.44 10.9-10.92 0-1.12-.13-1.92-.32-2.58H12.48z"
			fill="currentColor"
		/>
	</svg>
);

const connections = [
	{
		name: "Google",
		icon: <GoogleIcon className="h-6 w-6" />,
		description:
			"Connect your Google account for calendar and drive integrations.",
	},
	{
		name: "GitHub",
		icon: <Github className="h-6 w-6" />,
		description: "Connect your GitHub account to sync issues and repositories.",
	},
	{
		name: "Slack",
		icon: <Slack className="h-6 w-6" />,
		description: "Connect your Slack workspace to receive notifications.",
	},
];

const ConnectionsSettings = () => {
	return (
		<div className="h-full flex flex-col">
			<h2 className="text-2xl font-bold mb-6">Connections</h2>
			<div className="flex-grow relative">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{connections.map((conn) => (
						<Card key={conn.name}>
							<CardHeader>
								<CardTitle className="flex items-center gap-3">
									{conn.icon}
									{conn.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">
									{conn.description}
								</p>
							</CardContent>
							<CardFooter>
								<Button variant="outline" disabled>
									Connect
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
				<div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg text-center p-4">
					<h2 className="text-5xl sm:text-6xl font-semibold text-muted-foreground">
						Coming Soon
					</h2>
					<p className="mt-4 text-lg sm:text-xl text-muted-foreground/80 max-w-md">
						Integrations with your favorite tools are on the way.
					</p>
					<div className="flex items-center gap-8 mt-8 text-muted-foreground">
						<GoogleIcon className="h-10 w-10" />
						<Github className="h-10 w-10" />
						<Slack className="h-10 w-10" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConnectionsSettings;

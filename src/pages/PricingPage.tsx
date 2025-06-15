import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
	{
		name: "Free",
		price: "$0",
		features: ["1 Workspace", "Up to 3 boards", "Basic support"],
		cta: "Get Started",
		link: "/auth?mode=signup",
	},
	{
		name: "Pro",
		price: "$10",
		price_extra: "/ month",
		features: [
			"Unlimited Workspaces",
			"Unlimited boards",
			"Advanced features",
			"Priority support",
		],
		cta: "Upgrade to Pro",
		link: "#",
	},
	{
		name: "Enterprise",
		price: "Contact Us",
		features: [
			"SAML SSO",
			"Custom contract",
			"Dedicated manager",
			"Premium support",
		],
		cta: "Contact Sales",
		link: "/contact",
	},
];

const PricingPage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
			<div className="relative w-full max-w-7xl">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{tiers.map((tier) => (
						<Card key={tier.name} className="flex flex-col">
							<CardHeader>
								<CardTitle>{tier.name}</CardTitle>
								<CardDescription className="text-4xl font-bold">
									{tier.price}{" "}
									<span className="text-sm font-normal text-muted-foreground">
										{tier.price_extra}
									</span>
								</CardDescription>
							</CardHeader>
							<CardContent className="flex-1">
								<ul className="space-y-4">
									{tier.features.map((feature) => (
										<li key={feature} className="flex items-center">
											<Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
							<CardFooter>
								<Button
									asChild
									className="w-full"
									variant={tier.name === "Pro" ? "default" : "outline"}
								>
									<Link to={tier.link}>{tier.cta}</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
				<div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg text-center p-4">
					<h2 className="text-7xl sm:text-8xl font-semibold text-muted-foreground">
						Coming Soon
					</h2>
					<p className="mt-4 text-xl sm:text-2xl text-muted-foreground/80 max-w-md">
						We're putting the finishing touches on our plans. Stay tuned!
					</p>
				</div>
			</div>
		</div>
	);
};

export default PricingPage;

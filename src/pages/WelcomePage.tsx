import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Edit3, Laptop, LogOut, Sun, Moon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Particles from "@/components/Particles";
import RotatingText from "@/components/RotatingText";
import Orb from "@/components/Orb";

const WelcomePage = () => {
	const { user: currentUser } = useOutletContext<{ user: User | null }>();
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const checkTheme = () => {
			const isDark = document.documentElement.classList.contains("dark");
			setIsDarkMode(isDark);
		};
		checkTheme();

		const observer = new MutationObserver(checkTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	const particleColors = isDarkMode
		? ["#FFFFFF", "#BBBBBB"]
		: ["#333333", "#555555"];

	return (
		<div className="flex flex-col min-h-screen animate-fade-in relative overflow-hidden">
			<div className="absolute top-0 left-0 w-full h-full z-0">
				<Particles
					className="h-full w-full"
					particleColors={particleColors}
					particleCount={500}
					particleSpread={12}
					speed={0.1}
					particleBaseSize={200}
					moveParticlesOnHover={true}
					alphaParticles={true}
					disableRotation={false}
				/>
			</div>

			<div className="relative z-10 flex flex-col min-h-screen">
				<main className="flex-grow flex items-center justify-center px-4">
					<div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl w-full">
						<div className="flex flex-col items-start text-left">
							<h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
								Organise your work,
								<br />
								and your{" "}
								<RotatingText
									texts={["life", "projects", "team", "ideas"]}
									mainClassName="px-3 bg-primary text-primary-foreground overflow-hidden py-1 rounded-lg inline-flex"
									staggerFrom={"first"}
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "-100%" }}
									staggerDuration={0.05}
									splitLevelClassName="overflow-hidden"
									transition={{ type: "spring", damping: 20, stiffness: 200 }}
									rotationInterval={2000}
								/>
								, finally.
							</h2>
							<p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
								Schedulr is the connected workspace where better, faster work
								happens. Simple, powerful, and beautiful.
							</p>
							{currentUser ? (
								<Button size="lg" asChild className="px-8 py-3 text-lg">
									<Link to="/workspace">Open Workspace</Link>
								</Button>
							) : (
								<Button size="lg" asChild className="px-8 py-3 text-lg">
									<Link to="/auth?mode=signup">Get Schedulr Free</Link>
								</Button>
							)}
						</div>
						<div className="hidden md:flex justify-center items-center">
							<div className="relative w-96 h-96">
								<div className="absolute inset-0 z-0">
									<Orb
										hoverIntensity={0.5}
										rotateOnHover={true}
										hue={240}
										forceHoverState={false}
									/>
								</div>
								<img
									src="/favicon.ico"
									alt="Schedulr Logo"
									className="absolute inset-0 m-auto w-48 h-48 object-contain z-10"
								/>
							</div>
						</div>
					</div>
				</main>

				<footer className="py-12 bg-background/50 backdrop-blur-sm">
					<div className="container mx-auto px-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
							<div className="flex flex-col items-center md:items-start">
								<Zap className="w-12 h-12 text-primary mb-3" />
								<h3 className="text-xl font-semibold text-foreground mb-2">
									Boost Productivity
								</h3>
								<p className="text-muted-foreground">
									Streamline your tasks and projects with intuitive tools.
								</p>
							</div>
							<div className="flex flex-col items-center md:items-start">
								<Edit3 className="w-12 h-12 text-primary mb-3" />
								<h3 className="text-xl font-semibold text-foreground mb-2">
									Flexible Editing
								</h3>
								<p className="text-muted-foreground">
									Create and customise notes, pages, and documents effortlessly.
								</p>
							</div>
							<div className="flex flex-col items-center md:items-start">
								<Laptop className="w-12 h-12 text-primary mb-3" />
								<h3 className="text-xl font-semibold text-foreground mb-2">
									Desktop App
								</h3>
								<p className="text-muted-foreground">
									Our native desktop app is coming soon, stay tuned for updates!
								</p>
							</div>
						</div>
					</div>
					<div className="mt-12 text-center text-sm text-muted-foreground">
						<div className="flex justify-center gap-4 mb-2">
							<Link
								to="/terms"
								className="hover:text-foreground transition-colors"
							>
								Terms of Service
							</Link>
							<Link
								to="/privacy"
								className="hover:text-foreground transition-colors"
							>
								Privacy Policy
							</Link>
						</div>
						© {new Date().getFullYear()} Schedulr. Built with Lovable.
					</div>
				</footer>
			</div>
		</div>
	);
};

export default WelcomePage;

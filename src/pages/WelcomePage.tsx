import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Zap,
	Edit3,
	Laptop,
	Download,
	Monitor,
	CloudOff,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Particles from "@/components/Particles";
import RotatingText from "@/components/RotatingText";
import Orb from "@/components/Orb";
import Logo from "@/components/Logo";
import useIsElectron from "@/hooks/useIsElectron";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const WelcomePage = () => {
	const { user: currentUser } = useOutletContext<{ user: User | null }>();
	const [isDarkMode, setIsDarkMode] = useState(false);
	const isElectron = useIsElectron();
	const [showSignupDialog, setShowSignupDialog] = useState(false);
	const [openImage, setOpenImage] = useState<string | null>(null);

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

	// Desktop download link (only shown in the web app)
	const downloadUrl = `https://github.com/danblock97/schedulr/releases/download/v${__APP_VERSION__}/scheduler-${__APP_VERSION__}.exe`;

	// Embla carousel setup for desktop feature screenshots
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: true,
		align: "center",
	});
	const scrollPrev = () => emblaApi?.scrollPrev();
	const scrollNext = () => emblaApi?.scrollNext();

	const baseImagePath = `${import.meta.env.BASE_URL}images/`;

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
							<h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4 pt-56 leading-tight">
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
								<div className="flex gap-4 flex-wrap">
									<Button size="lg" asChild className="px-8 py-3 text-lg">
										<Link to="/workspace">Open Workspace</Link>
									</Button>
									{!isElectron && (
										<Button
											variant="outline"
											size="lg"
											asChild
											className="px-8 py-3 text-lg"
										>
											<a
												href={downloadUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												Desktop App
											</a>
										</Button>
									)}
								</div>
							) : isElectron ? (
								<Button
									size="lg"
									className="px-8 py-3 text-lg"
									onClick={() => setShowSignupDialog(true)}
								>
									Get Schedulr Free
								</Button>
							) : (
								<div className="flex gap-4 flex-wrap">
									<Button size="lg" asChild className="px-8 py-3 text-lg">
										<Link to="/auth?mode=signup">Get Schedulr Free</Link>
									</Button>
									<Button
										variant="outline"
										size="lg"
										asChild
										className="px-8 py-3 text-lg"
									>
										<a
											href={downloadUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											Desktop App
										</a>
									</Button>
								</div>
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
								<Logo className="absolute inset-0 m-auto w-48 h-48 object-contain z-10" />
							</div>
						</div>
					</div>
				</main>

				{/* Desktop App Feature Section */}
				<section
					id="desktop-app"
					className="py-24 md:py-32 bg-muted/20 dark:bg-muted/10 border-t border-border/50 mt-24 snap-start"
				>
					<div className="container mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
						{/* Carousel */}
						<div className="flex flex-col items-center md:items-end gap-4">
							<div
								className="embla overflow-hidden rounded-2xl shadow-xl w-full max-w-lg"
								ref={emblaRef}
							>
								<div className="embla__container flex">
									{[
										"desktop-app-feature.png",
										"desktop-app-kanban.png",
										"desktop-app-todo.png",
										"desktop-app-calendar.png",
									].map((src) => (
										<div
											key={src}
											className="embla__slide flex-shrink-0 w-full"
										>
											<img
												src={`${baseImagePath}${src}`}
												alt={src}
												className="w-full h-auto select-none cursor-zoom-in"
												onClick={() => setOpenImage(`${baseImagePath}${src}`)}
											/>
										</div>
									))}
								</div>
							</div>
							{/* Carousel Controls */}
							<div className="flex gap-3 mt-2">
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9"
									onClick={scrollPrev}
								>
									<ChevronLeft className="h-5 w-5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9"
									onClick={scrollNext}
								>
									<ChevronRight className="h-5 w-5" />
								</Button>
							</div>
						</div>

						{/* Content */}
						<div className="flex flex-col gap-6 text-center md:text-left max-w-xl mx-auto md:mx-0">
							<h3 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
								Power-up with our Desktop App
							</h3>
							<p className="text-muted-foreground text-lg">
								Enjoy a distraction-free native experience, with offline access
								and instant sync once you're back online.
							</p>
							<ul className="space-y-3">
								<li className="flex items-start gap-3">
									<Download className="h-5 w-5 text-primary flex-shrink-0" />
									<span>Lightweight installer under 80&nbsp;MB</span>
								</li>
								<li className="flex items-start gap-3">
									<Monitor className="h-5 w-5 text-primary flex-shrink-0" />
									<span>Tailored UI for big-screen productivity</span>
								</li>
								<li className="flex items-start gap-3">
									<CloudOff className="h-5 w-5 text-primary flex-shrink-0" />
									<span>Works offline – perfect for flights & cafés</span>
								</li>
								<li className="flex items-start gap-3">
									<RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
									<span>Automatic updates keep you on the latest version</span>
								</li>
							</ul>

							{!isElectron && (
								<div className="mt-6">
									<Button asChild size="lg" className="px-8 py-3 text-lg">
										<a
											href={downloadUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											Download Desktop&nbsp;App
										</a>
									</Button>
								</div>
							)}
						</div>
					</div>
				</section>

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
									{isElectron ? (
										"You're running the desktop app."
									) : (
										<span>Experience Schedulr natively on Windows.</span>
									)}
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
						© {new Date().getFullYear()} Schedulr. Built with ❤️ by{" "}
						<a
							href="https://danblock.dev"
							className="text-primary"
							onClick={(e) => {
								if (isElectron) {
									e.preventDefault();
									window.electron?.openExternal("https://danblock.dev");
								}
							}}
						>
							danblock.dev
						</a>
					</div>
				</footer>
			</div>

			{isElectron && (
				<AlertDialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Continue sign up in browser</AlertDialogTitle>
							<AlertDialogDescription>
								For security reasons we need to verify your email in the
								browser. Continue?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									window.electron?.openExternal(
										`${window.location.origin}/auth?mode=signup&source=desktop`
									);
								}}
							>
								Continue in Browser
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}

			{/* Image Lightbox */}
			{openImage && (
				<Dialog
					open={!!openImage}
					onOpenChange={(o) => !o && setOpenImage(null)}
				>
					<DialogContent className="w-full max-w-3xl bg-transparent border-none p-0">
						<img
							src={openImage}
							alt="Desktop screenshot"
							className="w-full h-auto rounded-lg"
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default WelcomePage;

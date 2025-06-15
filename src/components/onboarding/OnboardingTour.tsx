import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OnboardingTourProps {
	showTour: boolean;
	onComplete: () => void;
}

const tourSteps = [
	{
		title: "Welcome to Schedulr!",
		description:
			"Let's take a quick tour of the main features to get you started.",
	},
	{
		title: "Your Workspace Sidebar",
		description:
			"On the left, you’ll find your navigation sidebar. Use it to switch between your dashboard, pages, and trash. You can also create new pages from here.",
	},
	{
		title: "Creating & Organising Pages",
		description:
			'Click "New Page" in the sidebar to create different types of pages - from simple documents to complex Kanban boards. Organise all your work in one place.',
	},
	{
		title: "The Central Dashboard",
		description:
			"Your main workspace view is the dashboard. It gives you a quick overview of recently visited pages, upcoming events, and your tasks, helping you stay on top of your work.",
	},
	{
		title: "Account Settings",
		description:
			"Click on your avatar in the top right to open the menu. From there you can access your settings to customise your profile, appearance, and notification preferences.",
	},
	{
		title: "You are all set!",
		description:
			"That's a quick overview of Schedulr. You're ready to start organising your work and life. Enjoy!",
	},
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({
	showTour,
	onComplete,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		if (showTour) {
			setTimeout(() => setIsOpen(true), 500); // Small delay to allow UI to settle
		}
	}, [showTour]);

	const handleNext = () => {
		if (currentStep < tourSteps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleFinish = () => {
		setIsOpen(false);
		onComplete();
	};

	const handleSkip = () => {
		setIsOpen(false);
		onComplete();
	};

	if (!isOpen) {
		return null;
	}

	const step = tourSteps[currentStep];
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === tourSteps.length - 1;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent
				className="sm:max-w-[425px]"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>{step.title}</DialogTitle>
					<DialogDescription>{step.description}</DialogDescription>
				</DialogHeader>

				<div className="flex items-center justify-center my-4">
					<div className="flex space-x-2">
						{tourSteps.map((_, index) => (
							<div
								key={index}
								className={`h-2 w-2 rounded-full transition-colors ${
									index === currentStep ? "bg-primary" : "bg-muted"
								}`}
							/>
						))}
					</div>
				</div>

				<Separator />

				<DialogFooter className="mt-4 flex justify-between w-full">
					<Button variant="ghost" onClick={handleSkip}>
						Skip Tour
					</Button>
					<div className="flex gap-2">
						{!isFirstStep && (
							<Button variant="outline" onClick={handlePrev}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
						)}
						{isLastStep ? (
							<Button onClick={handleFinish}>Finish</Button>
						) : (
							<Button onClick={handleNext}>
								Next
								<ArrowRight className="h-4 w-4 ml-2" />
							</Button>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default OnboardingTour;

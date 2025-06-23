import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-gradient-to-b dark:from-neutral-700 dark:to-neutral-800 dark:hover:from-neutral-600 dark:hover:to-neutral-700 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.6)]",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-gradient-to-b dark:from-red-700 dark:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.6)]",
				outline:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-950 dark:hover:from-neutral-800 dark:hover:to-neutral-900 dark:border-neutral-700/60 dark:text-foreground dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04),0_2px_4px_rgba(0,0,0,0.6)]",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 dark:hover:from-neutral-700 dark:hover:to-neutral-800 dark:border dark:border-neutral-700/60 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.6)]",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-neutral-800/70 dark:hover:text-foreground dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04),0_2px_3px_rgba(0,0,0,0.5)]",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 px-3",
				lg: "h-11 px-8",
				icon: "h-10 w-10",
			},
			rounded: {
				// Added rounded variant
				default: "rounded-md",
				full: "rounded-full",
				lg: "rounded-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			rounded: "default", // Set default rounding
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, rounded, className }))}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };

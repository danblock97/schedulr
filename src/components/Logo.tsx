import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	alt?: string;
}

const Logo: React.FC<LogoProps> = ({ className, alt = "Schedulr Logo" }) => {
	const [isDarkMode, setIsDarkMode] = useState(
		typeof document !== "undefined" &&
			document.documentElement.classList.contains("dark")
	);

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDarkMode(document.documentElement.classList.contains("dark"));
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	const logoSrc = isDarkMode
		? `${import.meta.env.BASE_URL}images/logo-light.png`
		: `${import.meta.env.BASE_URL}images/logo-dark.png`;

	return (
		<img
			src={logoSrc}
			alt={alt}
			className={cn("select-none object-contain", className)}
		/>
	);
};

export default Logo;

import React from "react";
import { Minus, Square, X } from "lucide-react";
import useIsElectron from "@/hooks/useIsElectron";

const noDrag: any = { WebkitAppRegion: "no-drag" };

const buttonClasses =
	"w-8 h-8 flex items-center justify-center hover:bg-muted rounded-md";

const WindowControls: React.FC = () => {
	const isElectron = useIsElectron();

	if (!isElectron) return null;

	return (
		<div className="flex items-center ml-2 select-none" style={noDrag}>
			<button
				className={buttonClasses}
				onClick={() => window.electron?.windowAction("minimize")}
				aria-label="Minimize"
			>
				<Minus className="w-4 h-4" />
			</button>
			<button
				className={buttonClasses}
				onClick={() => window.electron?.windowAction("maximize")}
				aria-label="Maximize"
			>
				<Square className="w-4 h-4" />
			</button>
			<button
				className={`${buttonClasses} hover:text-red-500`}
				onClick={() => window.electron?.windowAction("close")}
				aria-label="Close"
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
};

export default WindowControls;

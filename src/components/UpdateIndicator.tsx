import React, { useEffect, useState } from "react";
import { DownloadCloud } from "lucide-react";
import useIsElectron from "@/hooks/useIsElectron";
import { Button } from "@/components/ui/button";
import {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

const UpdateIndicator: React.FC = () => {
	const isElectron = useIsElectron();
	const [updateReady, setUpdateReady] = useState(false);

	useEffect(() => {
		if (!isElectron) return;
		window.electron?.onUpdateStatus((status: string) => {
			if (status === "update-downloaded") {
				setUpdateReady(true);
			}
		});
	}, [isElectron]);

	if (!isElectron || !updateReady) return null;

	const handleInstall = () => {
		window.electron?.installUpdate();
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="text-green-600 animate-bounce"
						onClick={handleInstall}
					>
						<DownloadCloud className="w-5 h-5" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Update ready – click to restart & install</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default UpdateIndicator;

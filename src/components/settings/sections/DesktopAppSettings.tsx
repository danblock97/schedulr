import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useIsElectron from "@/hooks/useIsElectron";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const DesktopAppSettings: React.FC = () => {
	const isElectron = useIsElectron();
	const [minimizeToTray, setMinimizeToTray] = useState<boolean>(false);
	const [autoStart, setAutoStart] = useState<boolean>(false);
	const [startHidden, setStartHidden] = useState<boolean>(false);

	useEffect(() => {
		if (!isElectron) return;
		const pref = localStorage.getItem("desktop_minimize_to_tray") === "true";
		setMinimizeToTray(pref);
		window.electron
			?.getStartup()
			.then((s: { enabled: boolean; hidden: boolean }) => {
				setAutoStart(s.enabled);
				setStartHidden(!!s.hidden);
			})
			.catch(() => {});
	}, [isElectron]);

	const handleMinimizeToggle = (val: boolean) => {
		setMinimizeToTray(val);
		localStorage.setItem("desktop_minimize_to_tray", String(val));
	};

	const handleAutoStartToggle = async (val: boolean) => {
		setAutoStart(val);
		try {
			await window.electron?.setStartup({ enabled: val, hidden: startHidden });
		} catch {}
	};

	const handleHiddenChange = async (hiddenVal: boolean) => {
		setStartHidden(hiddenVal);
		try {
			await window.electron?.setStartup({
				enabled: autoStart,
				hidden: hiddenVal,
			});
		} catch {}
	};

	if (!isElectron) {
		return (
			<div className="text-center text-muted-foreground">
				Desktop features are only available in the desktop app.
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-bold">Desktop App</h2>
				<p className="text-muted-foreground">
					Configure desktop-specific behaviour.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Window Behaviour</CardTitle>
					<CardDescription>
						Choose what happens when you press the close button.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-between py-4">
					<span>Minimise to tray instead of quitting</span>
					<Switch
						checked={minimizeToTray}
						onCheckedChange={handleMinimizeToggle}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Startup</CardTitle>
					<CardDescription>
						Control whether Schedulr starts automatically when your computer
						boots.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 py-4">
					<div className="flex items-center justify-between">
						<span>Launch at login</span>
						<Switch
							checked={autoStart}
							onCheckedChange={handleAutoStartToggle}
						/>
					</div>
					{autoStart && (
						<div>
							<p className="text-sm mb-2">When starting:</p>
							<RadioGroup
								value={startHidden ? "hidden" : "show"}
								onValueChange={(v) => handleHiddenChange(v === "hidden")}
								className="space-y-2"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="show" id="start-show" />
									<Label htmlFor="start-show">Show window</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="hidden" id="start-hidden" />
									<Label htmlFor="start-hidden">Start minimized to tray</Label>
								</div>
							</RadioGroup>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default DesktopAppSettings;

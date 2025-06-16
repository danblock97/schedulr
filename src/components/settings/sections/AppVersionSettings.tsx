import React from "react";

const AppVersionSettings: React.FC = () => {
	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-bold">App Version</h2>
				<p className="text-muted-foreground">
					Current installed version of Schedulr.
				</p>
			</div>
			<div className="flex items-center justify-center p-6 border rounded-lg bg-muted/50">
				<p className="text-lg font-mono">v{__APP_VERSION__}</p>
			</div>
		</div>
	);
};

export default AppVersionSettings;

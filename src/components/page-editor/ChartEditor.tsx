import React, { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
	type ChartConfig,
} from "@/components/ui/chart";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

interface ChartEditorProps {
	pageData: Tables<"pages">;
}

const defaultChartContent = {
	data: [
		{ month: "January", desktop: 186, mobile: 80 },
		{ month: "February", desktop: 305, mobile: 200 },
		{ month: "March", desktop: 237, mobile: 120 },
		{ month: "April", desktop: 73, mobile: 190 },
		{ month: "May", desktop: 209, mobile: 130 },
		{ month: "June", desktop: 214, mobile: 140 },
	],
};

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "hsl(var(--chart-1))",
	},
	mobile: {
		label: "Mobile",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

const ChartEditor: React.FC<ChartEditorProps> = ({ pageData }) => {
	const { toast } = useToast();
	const [content, setContent] = useState<any>(pageData.content);

	useEffect(() => {
		const initializeContent = async () => {
			const contentIsValid =
				pageData.content &&
				typeof pageData.content === "object" &&
				pageData.content !== null &&
				"data" in pageData.content;

			if (!contentIsValid) {
				setContent(defaultChartContent);
				const { error } = await supabase
					.from("pages")
					.update({ content: defaultChartContent as any })
					.eq("id", pageData.id);

				if (error) {
					toast({
						title: "Error initializing chart",
						description: error.message,
						variant: "destructive",
					});
				}
			}
		};
		initializeContent();
	}, [pageData.id, pageData.content, toast]);

	if (!content || !content.data) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
				<p>Loading chart data...</p>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-8">
			<Card>
				<CardHeader>
					<CardTitle>{pageData.title}</CardTitle>
					<CardDescription>January - June 2025</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
						<BarChart data={content.data}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="month"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
							/>
							<YAxis />
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="dot" />}
							/>
							<ChartLegend content={<ChartLegendContent />} />
							<Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
							<Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
};

export default ChartEditor;

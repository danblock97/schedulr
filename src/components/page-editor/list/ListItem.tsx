import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ListItemType, Priority } from "./types";
import { motion } from "framer-motion";
import { TableRow, TableCell } from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ListItemProps {
	item: ListItemType;
	onUpdate: (id: string, updates: Partial<ListItemType>) => void;
	onDelete: (id: string) => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
	{ value: "none", label: "Priority", color: "text-muted-foreground" },
	{ value: "low", label: "Low", color: "text-blue-500" },
	{ value: "medium", label: "Medium", color: "text-yellow-500" },
	{ value: "high", label: "High", color: "text-red-500" },
];

const ListItem: React.FC<ListItemProps> = ({ item, onUpdate, onDelete }) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: item.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const selectedPriority = priorityOptions.find(
		(p) => p.value === (item.priority || "none")
	);

	return (
		<motion.tr
			ref={setNodeRef}
			style={style}
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
			className="group border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
		>
			<TableCell className="w-12 px-2">
				<Button
					variant="ghost"
					size="icon"
					{...attributes}
					{...listeners}
					className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground"
				>
					<GripVertical className="h-5 w-5" />
				</Button>
			</TableCell>
			<TableCell className="w-12 px-2">
				<Checkbox
					checked={item.completed}
					onCheckedChange={(checked) =>
						onUpdate(item.id, { completed: !!checked })
					}
					className="transition-all"
				/>
			</TableCell>
			<TableCell className="pr-2">
				<Input
					value={item.text}
					onChange={(e) => onUpdate(item.id, { text: e.target.value })}
					className={`h-auto bg-transparent border-none focus:ring-0 p-0 transition-all duration-300 placeholder:text-muted-foreground/60 ${
						item.completed
							? "line-through text-muted-foreground"
							: "text-foreground"
					}`}
					placeholder="What's on your mind?"
				/>
			</TableCell>
			<TableCell className="w-40 px-2">
				<Select
					value={item.priority || "none"}
					onValueChange={(value: Priority) =>
						onUpdate(item.id, { priority: value })
					}
				>
					<SelectTrigger className="w-full h-9 border-none bg-transparent focus:ring-0 focus:ring-offset-0">
						<SelectValue asChild>
							<span className={cn("font-medium", selectedPriority?.color)}>
								{selectedPriority?.label}
							</span>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{priorityOptions.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								<span className={cn("font-medium", opt.color)}>
									{opt.label}
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</TableCell>
			<TableCell className="w-48 px-2">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={"ghost"}
							className={cn(
								"w-full h-9 justify-start text-left font-normal p-2",
								!item.dueDate && "text-muted-foreground"
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{item.dueDate ? (
								format(new Date(item.dueDate), "PPP")
							) : (
								<span>Pick a date</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={item.dueDate ? new Date(item.dueDate) : undefined}
							onSelect={(date) =>
								onUpdate(item.id, { dueDate: date ? date.toISOString() : null })
							}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</TableCell>
			<TableCell className="w-12 px-2 text-right">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDelete(item.id)}
					className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</TableCell>
		</motion.tr>
	);
};

export default ListItem;

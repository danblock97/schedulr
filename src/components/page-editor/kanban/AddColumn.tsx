import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

interface AddColumnProps {
	onAddColumn: (title: string) => void;
}

const AddColumn: React.FC<AddColumnProps> = ({ onAddColumn }) => {
	const [newColumnName, setNewColumnName] = useState("");
	const [isAddingColumn, setIsAddingColumn] = useState(false);

	const handleAddColumn = () => {
		if (newColumnName.trim()) {
			onAddColumn(newColumnName.trim());
			setNewColumnName("");
			setIsAddingColumn(false);
		}
	};

	if (isAddingColumn) {
		return (
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="p-2 bg-muted rounded-xl w-[350px] flex-shrink-0"
			>
				<Input
					autoFocus
					placeholder="Enter column title..."
					value={newColumnName}
					onChange={(e) => setNewColumnName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleAddColumn();
						if (e.key === "Escape") {
							setIsAddingColumn(false);
							setNewColumnName("");
						}
					}}
				/>
				<div className="mt-2 flex items-center justify-end gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setIsAddingColumn(false);
							setNewColumnName("");
						}}
					>
						Cancel
					</Button>
					<Button size="sm" onClick={handleAddColumn}>
						Add
					</Button>
				</div>
			</motion.div>
		);
	}

	return (
		<div className="w-[350px] flex-shrink-0">
			<Button
				variant="ghost"
				className="w-full justify-start p-3 h-auto text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
				onClick={() => setIsAddingColumn(true)}
			>
				<PlusCircle className="mr-2 h-4 w-4" />
				Add another column
			</Button>
		</div>
	);
};

export default AddColumn;

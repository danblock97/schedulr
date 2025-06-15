import React from "react";
import {
	Bug,
	Shield,
	CheckCircle2,
	CheckSquare,
	BookOpen,
	LucideProps,
	Lightbulb,
} from "lucide-react";
import { IssueType } from "./types";

interface IssueTypeIconProps {
	type?: IssueType;
	className?: string;
}

const iconMap: Record<IssueType, React.FC<LucideProps>> = {
	Bug: Bug,
	Security: Shield,
	"Feature request": Lightbulb,
	Task: CheckSquare,
	Story: BookOpen,
};

const IssueTypeIcon: React.FC<IssueTypeIconProps> = ({ type, className }) => {
	if (!type) return null;
	const IconComponent = iconMap[type];
	if (!IconComponent) return null;

	return <IconComponent className={className} />;
};

export default IssueTypeIcon;

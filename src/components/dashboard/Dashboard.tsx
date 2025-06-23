import React from "react";
import RecentlyVisited from "./RecentlyVisited";
import type { User } from "@supabase/supabase-js";
import WorkspaceSearch from "./WorkspaceSearch";
import UpcomingEvents from "./UpcomingEvents";
import MyTasks from "./MyTasks";
import StatsOverview from "./StatsOverview";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

interface DashboardProps {
	user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
	const username =
		user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
		},
	};

	return (
		<motion.div
			className="space-y-10 max-w-5xl mx-auto"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.div className="flex items-center gap-3" variants={itemVariants}>
				<Logo className="h-8 w-8" />
				<h1 className="text-3xl font-bold">Good afternoon, {username}</h1>
			</motion.div>
			<motion.div variants={itemVariants}>
				<StatsOverview userId={user.id} />
			</motion.div>
			<motion.div variants={itemVariants}>
				<WorkspaceSearch />
			</motion.div>
			<motion.div variants={itemVariants}>
				<RecentlyVisited userId={user.id} />
			</motion.div>
			<motion.div variants={itemVariants}>
				<UpcomingEvents userId={user.id} />
			</motion.div>
			<motion.div variants={itemVariants}>
				<MyTasks userId={user.id} />
			</motion.div>
		</motion.div>
	);
};

export default Dashboard;

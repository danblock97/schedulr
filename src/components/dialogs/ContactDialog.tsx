import React, { useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import emailjs from "@emailjs/browser";
import { Loader2, CircleCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ContactDialog: React.FC<ContactDialogProps> = ({
	open,
	onOpenChange,
}) => {
	const { toast } = useToast();
	const form = useRef<HTMLFormElement>(null);
	const [isSending, setIsSending] = useState(false);
	const [isSent, setIsSent] = useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!form.current) return;
		setIsSending(true);
		emailjs
			.sendForm(
				import.meta.env.VITE_EMAILJS_SERVICE_ID,
				import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
				form.current,
				import.meta.env.VITE_EMAILJS_PUBLIC_KEY
			)
			.then(
				() => {
					setIsSent(true);
					form.current?.reset();
				},
				(error) => {
					console.error(error.text);
					toast({
						title: "Uh oh! Something went wrong.",
						description: "There was a problem sending your message.",
						variant: "destructive",
					});
				}
			)
			.finally(() => setIsSending(false));
	};

	const formVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
		exit: { opacity: 0 },
	};
	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-0">
				<DialogHeader>
					<DialogTitle className="sr-only">Contact Us</DialogTitle>
				</DialogHeader>
				<Card className="border-none shadow-none dark:bg-transparent dark:shadow-none">
					<CardHeader>
						<CardTitle>Contact Us</CardTitle>
						<CardDescription>
							Have a question or want to work with us? Fill out the form below.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<AnimatePresence mode="wait">
							{isSent ? (
								<motion.div
									key="success"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.4, ease: "backOut" }}
									className="text-center py-8 flex flex-col items-center"
								>
									<CircleCheck className="h-16 w-16 text-green-500" />
									<h3 className="mt-4 text-2xl font-semibold">Message Sent!</h3>
									<p className="mt-2 text-muted-foreground">
										Thanks for reaching out. We'll be in touch soon.
									</p>
									<Button onClick={() => setIsSent(false)} className="mt-6">
										Send Another Message
									</Button>
								</motion.div>
							) : (
								<motion.form
									key="form"
									ref={form}
									onSubmit={handleSubmit}
									className="space-y-4"
									variants={formVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
								>
									{/* Name */}
									<motion.div variants={itemVariants} className="space-y-2">
										<label htmlFor="name" className="text-sm font-medium">
											Name
										</label>
										<Input id="name" name="user_name" required />
									</motion.div>
									{/* Email */}
									<motion.div variants={itemVariants} className="space-y-2">
										<label htmlFor="email" className="text-sm font-medium">
											Email
										</label>
										<Input id="email" name="user_email" type="email" required />
									</motion.div>
									{/* Subject */}
									<motion.div variants={itemVariants} className="space-y-2">
										<label htmlFor="subject" className="text-sm font-medium">
											Subject
										</label>
										<Input id="subject" name="subject" required />
									</motion.div>
									{/* Message */}
									<motion.div variants={itemVariants} className="space-y-2">
										<label htmlFor="message" className="text-sm font-medium">
											Message
										</label>
										<Textarea id="message" name="message" rows={4} required />
									</motion.div>
									<Button type="submit" className="w-full" disabled={isSending}>
										{isSending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Send Message
									</Button>
								</motion.form>
							)}
						</AnimatePresence>
					</CardContent>
				</Card>
			</DialogContent>
		</Dialog>
	);
};

export default ContactDialog;

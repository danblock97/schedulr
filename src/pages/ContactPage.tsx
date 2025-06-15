import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
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
import { Loader2, CircleCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ContactPage = () => {
	const { toast } = useToast();
	const form = useRef<HTMLFormElement>(null);
	const [isSending, setIsSending] = useState(false);
	const [isSent, setIsSent] = useState(false);

	// IMPORTANT: Replace with your EmailJS public key from your EmailJS account settings.
	const EMAILJS_PUBLIC_KEY = "0ZRDXEAWbxZ7BsOU8";
	const EMAILJS_SERVICE_ID = "service_odzoxnu";
	const EMAILJS_TEMPLATE_ID = "template_ixflbsm";

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!form.current) return;

		setIsSending(true);

		emailjs
			.sendForm(
				EMAILJS_SERVICE_ID,
				EMAILJS_TEMPLATE_ID,
				form.current,
				EMAILJS_PUBLIC_KEY
			)
			.then(
				(result) => {
					console.log(result.text);
					setIsSent(true);
					form.current?.reset();
				},
				(error) => {
					console.log(error.text);
					toast({
						title: "Uh oh! Something went wrong.",
						description:
							"There was a problem sending your message. Please try again.",
						variant: "destructive",
					});
				}
			)
			.finally(() => {
				setIsSending(false);
			});
	};

	const formVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
		exit: {
			opacity: 0,
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<div className="container mx-auto px-4 py-16 sm:py-24">
			<motion.div
				className="max-w-2xl mx-auto"
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
			>
				<Card>
					<CardHeader>
						<CardTitle className="text-3xl">Contact Us</CardTitle>
						<CardDescription>
							Have a question or want to work with us? Fill out the form below.
						</CardDescription>
					</CardHeader>
					<CardContent className="overflow-hidden">
						<AnimatePresence mode="wait">
							{isSent ? (
								<motion.div
									key="success"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{
										opacity: 0,
										scale: 0.8,
										transition: { duration: 0.2 },
									}}
									transition={{ duration: 0.4, ease: "backOut" }}
									className="text-center py-8 flex flex-col items-center"
								>
									<motion.div
										initial={{ scale: 0 }}
										animate={{
											scale: 1,
											transition: {
												delay: 0.2,
												type: "spring",
												stiffness: 260,
												damping: 20,
											},
										}}
									>
										<CircleCheck className="h-20 w-20 text-green-500" />
									</motion.div>
									<motion.h3
										className="mt-6 text-2xl font-semibold"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
									>
										Message Sent!
									</motion.h3>
									<motion.p
										className="mt-2 text-muted-foreground"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
									>
										Thanks for reaching out. We'll be in touch soon.
									</motion.p>
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
									>
										<Button onClick={() => setIsSent(false)} className="mt-8">
											Send Another Message
										</Button>
									</motion.div>
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
									<motion.div className="space-y-2" variants={itemVariants}>
										<label
											htmlFor="name"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Name
										</label>
										<Input
											id="name"
											name="user_name"
											placeholder="Your Name"
											required
										/>
									</motion.div>
									<motion.div className="space-y-2" variants={itemVariants}>
										<label
											htmlFor="email"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Email
										</label>
										<Input
											id="email"
											name="user_email"
											type="email"
											placeholder="your@email.com"
											required
										/>
									</motion.div>
									<motion.div className="space-y-2" variants={itemVariants}>
										<label
											htmlFor="subject"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Subject
										</label>
										<Input
											id="subject"
											name="subject"
											placeholder="What is this about?"
											required
										/>
									</motion.div>
									<motion.div className="space-y-2" variants={itemVariants}>
										<label
											htmlFor="message"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Message
										</label>
										<Textarea
											id="message"
											name="message"
											placeholder="Your message..."
											rows={5}
											required
										/>
									</motion.div>
									<motion.div variants={itemVariants}>
										<Button
											type="submit"
											className="w-full"
											disabled={isSending}
										>
											{isSending && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{isSending ? "Sending..." : "Send Message"}
										</Button>
									</motion.div>
								</motion.form>
							)}
						</AnimatePresence>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
};

export default ContactPage;

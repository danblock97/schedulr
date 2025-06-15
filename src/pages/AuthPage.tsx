import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [mode, setMode] = useState<"login" | "signup">(
		searchParams.get("mode") === "signup" ? "signup" : "login"
	);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState(""); // For signup
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

	useEffect(() => {
		// ... keep existing code (useEffect for mode)
	}, [searchParams, setSearchParams]);

	useEffect(() => {
		// ... keep existing code (useEffect for session check)
	}, [navigate]);

	const toggleMode = () => {
		const newMode = mode === "login" ? "signup" : "login";
		setMode(newMode);
		setSearchParams({ mode: newMode });
		setError("");
		setEmail("");
		setPassword("");
		setUsername("");
		setShowConfirmationMessage(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (mode === "signup") {
			if (!username.trim()) {
				setError("Username is required for signup.");
				setIsLoading(false);
				return;
			}
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: { username: username.trim() },
					// emailRedirectTo is critical for email confirmation flow
					emailRedirectTo: `${window.location.origin}/`,
				},
			});

			if (signUpError) {
				setError(signUpError.message);
			} else if (data.user) {
				if (data.session) {
					// This case happens if email confirmation is disabled. User is logged in.
					toast({
						title: "Signup Successful!",
						description: "You are now logged in.",
					});
					navigate("/");
				} else {
					// This case happens if email confirmation is enabled.
					setShowConfirmationMessage(true);
					toast({
						title: "Registration submitted!",
						description: "Please check your email to complete your signup.",
					});
				}
			} else {
				setError(
					"An unexpected error occurred during signup. Please try again."
				);
			}
		} else {
			// login mode
			// ... keep existing code (login logic)
		}

		setIsLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
			<motion.div
				className="w-full max-w-md"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeInOut" }}
			>
				<Card className="w-full shadow-xl rounded-lg">
					{showConfirmationMessage ? (
						<>
							<CardHeader className="text-center">
								<CardTitle className="text-2xl font-bold">
									Check your email
								</CardTitle>
								<CardDescription>
									We've sent a verification link to <strong>{email}</strong>.
									Please click the link to complete your registration.
								</CardDescription>
							</CardHeader>
							<CardFooter className="flex-col">
								<Button variant="link" onClick={toggleMode} className="mt-4">
									Back to Login
								</Button>
							</CardFooter>
						</>
					) : (
						<>
							<CardHeader className="text-center">
								<AnimatePresence mode="wait">
									<motion.div
										key={mode}
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										transition={{ duration: 0.2 }}
									>
										<CardTitle className="text-3xl font-bold">
											{mode === "login" ? "Welcome Back!" : "Create Account"}
										</CardTitle>
										<CardDescription>
											{mode === "login"
												? "Log in to access Schedulr."
												: "Sign up to start organizing."}
										</CardDescription>
									</motion.div>
								</AnimatePresence>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									<AnimatePresence>
										{mode === "signup" && (
											<motion.div
												className="space-y-2"
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.4, ease: "easeInOut" }}
												style={{ overflow: "hidden" }}
											>
												<Label htmlFor="username">Username</Label>
												<Input
													id="username"
													type="text"
													placeholder="Choose a username"
													value={username}
													onChange={(e) => setUsername(e.target.value)}
													required
													className="rounded-lg"
												/>
											</motion.div>
										)}
									</AnimatePresence>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="you@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
											className="rounded-lg"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											placeholder="••••••••"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className="rounded-lg"
										/>
									</div>
									{error && <p className="text-sm text-destructive">{error}</p>}
									<Button
										type="submit"
										className="w-full text-base py-3"
										disabled={isLoading}
										rounded="full"
									>
										{isLoading
											? "Processing..."
											: mode === "login"
											? "Log In"
											: "Sign Up"}
									</Button>
								</form>
							</CardContent>
							<CardFooter className="flex flex-col items-center space-y-2">
								<p className="text-sm text-muted-foreground">
									{mode === "login"
										? "Don't have an account?"
										: "Already have an account?"}
									<Button
										variant="link"
										onClick={toggleMode}
										className="font-semibold"
									>
										{mode === "login" ? "Sign Up" : "Log In"}
									</Button>
								</p>
								<Button
									variant="link"
									asChild
									className="text-sm text-muted-foreground"
								>
									<Link to="/">Back to Welcome</Link>
								</Button>
							</CardFooter>
						</>
					)}
				</Card>
			</motion.div>
		</div>
	);
};

export default AuthPage;

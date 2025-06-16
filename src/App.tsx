import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import AuthPage from "./pages/AuthPage";
import WorkspacePage from "./pages/WorkspacePage";
import PageEditorPage from "./pages/PageEditorPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import WorkspaceLayout from "./layouts/WorkspaceLayout";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import SettingsPage from "./pages/SettingsPage";
import PageLayout from "./layouts/PageLayout";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import { supabase } from "./integrations/supabase/client";
import { applyTheme, type Theme } from "./lib/theme";
import useIpcSupabase from "@/hooks/useIpcSupabase";
import useDesktopDeepLink from "@/hooks/useDesktopDeepLink";

const queryClient = new QueryClient();

const App = () => {
	useIpcSupabase();
	useDesktopDeepLink();
	useEffect(() => {
		const fetchAndApplyTheme = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("theme")
					.eq("id", user.id)
					.single();
				if (profile?.theme) {
					applyTheme(profile.theme as Theme);
				} else {
					applyTheme("system");
				}
			} else {
				applyTheme("system");
			}
		};

		fetchAndApplyTheme();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
				fetchAndApplyTheme();
			} else if (event === "SIGNED_OUT") {
				applyTheme("system");
			}
		});

		const systemThemeWatcher = window.matchMedia(
			"(prefers-color-scheme: dark)"
		);
		const handleSystemThemeChange = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			let theme: Theme = "system";
			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("theme")
					.eq("id", user.id)
					.single();
				if (profile) {
					theme = profile.theme as Theme;
				}
			}
			if (theme === "system") {
				applyTheme("system");
			}
		};

		systemThemeWatcher.addEventListener("change", handleSystemThemeChange);

		return () => {
			subscription.unsubscribe();
			systemThemeWatcher.removeEventListener("change", handleSystemThemeChange);
		};
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<Routes>
						<Route element={<PageLayout />}>
							<Route path="/" element={<WelcomePage />} />
							<Route path="/pricing" element={<PricingPage />} />
							<Route path="/contact" element={<ContactPage />} />
							<Route path="/terms" element={<TermsOfServicePage />} />
							<Route path="/privacy" element={<PrivacyPolicyPage />} />
						</Route>

						<Route path="/auth" element={<AuthPage />} />

						<Route element={<ProtectedRoute />}>
							<Route element={<WorkspaceLayout />}>
								<Route path="/workspace" element={<WorkspacePage />} />
								<Route
									path="/workspace/page/:pageId"
									element={<PageEditorPage />}
								/>
								<Route path="/settings" element={<SettingsPage />} />
							</Route>
						</Route>
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	);
};

export default App;

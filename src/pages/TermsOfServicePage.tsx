import React from "react";
import { Link } from "react-router-dom";

const TermsOfServicePage: React.FC = () => {
	return (
		<div className="bg-muted/20">
			<div className="container mx-auto max-w-3xl py-16 px-6">
				<h1 className="text-3xl font-bold mb-2 text-center">
					Terms of Service
				</h1>
				<p className="text-muted-foreground mb-10 text-center">
					Last updated: June 15, 2025
				</p>

				<div className="prose dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline">
					<p>
						Please read these Terms of Service ("Terms", "Terms of Service")
						carefully before using the Schedulr application (the "Service")
						operated by us.
					</p>

					<h2>1. Introduction</h2>
					<p>
						Your access to and use of the Service is conditioned on your
						acceptance of and compliance with these Terms. These Terms apply to
						all visitors, users, and others who access or use the Service.
					</p>

					<h2>2. User Accounts</h2>
					<p>
						When you create an account with us, you must provide us with
						information that is accurate, complete, and current at all times.
						Failure to do so constitutes a breach of the Terms, which may result
						in immediate termination of your account on our Service.
					</p>
					<p>
						You are responsible for safeguarding the password that you use to
						access the Service and for any activities or actions under your
						password. You agree not to disclose your password to any third
						party.
					</p>

					<h2>3. Right to Delete Account</h2>
					<p>
						You have the right to delete your account at any time. You can do
						this from your account settings page. Upon deletion, your personal
						data will be removed in accordance with our Privacy Policy. Please
						note that some data may be retained for legal or administrative
						purposes.
					</p>

					<h2>4. Third-Party Services</h2>
					<p>
						Our Service relies on third-party services to function, including
						but not limited to Supabase for backend infrastructure and database
						management, and Vercel for hosting. Your use of our Service is also
						subject to the terms and policies of these providers.
					</p>
					<ul>
						<li>
							<a
								href="https://supabase.com/terms"
								target="_blank"
								rel="noopener noreferrer"
							>
								Supabase Terms of Service
							</a>
						</li>
						<li>
							<a
								href="https://vercel.com/legal/terms"
								target="_blank"
								rel="noopener noreferrer"
							>
								Vercel Terms of Service
							</a>
						</li>
					</ul>
					<p>
						We do not control these third-party services and are not responsible
						for their performance or any issues arising from your use of them.
					</p>

					<h2>5. Intellectual Property</h2>
					<p>
						The Service and its original content, features, and functionality
						are and will remain the exclusive property of Schedulr and its
						licensors. The Service is protected by copyright, trademark, and
						other laws of both the United States and foreign countries.
					</p>

					<h2>6. Changes to Terms</h2>
					<p>
						We reserve the right, at our sole discretion, to modify or replace
						these Terms at any time. If a revision is material we will try to
						provide at least 30 days' notice prior to any new terms taking
						effect. What constitutes a material change will be determined at our
						sole discretion.
					</p>

					<h2>7. Contact Us</h2>
					<p>
						If you have any questions about these Terms, please{" "}
						<Link to="/contact">contact us</Link>.
					</p>

					<p className="text-sm text-muted-foreground mt-8 text-center italic">
						This is a template document. It is not legal advice. You should
						consult with a legal professional to ensure your Terms of Service
						are compliant with all applicable laws and regulations.
					</p>
				</div>
			</div>
		</div>
	);
};

export default TermsOfServicePage;

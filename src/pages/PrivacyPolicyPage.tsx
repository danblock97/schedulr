import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicyPage: React.FC = () => {
	return (
		<div className="bg-muted/20">
			<div className="container mx-auto max-w-3xl py-16 px-6">
				<h1 className="text-3xl font-bold mb-2 text-center">Privacy Policy</h1>
				<p className="text-muted-foreground mb-10 text-center">
					Last updated: June 15, 2025
				</p>

				<div className="prose dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline">
					<p>
						This Privacy Policy describes how your personal information is
						collected, used, and shared when you use the Schedulr application
						(the "Service").
					</p>

					<h2>1. Information We Collect</h2>
					<p>
						We collect information you provide directly to us when you create an
						account, such as your name, email address, and password. We also
						collect information automatically as you use the service, such as
						usage data, device information, and IP addresses.
					</p>
					<p>
						The content you create within the application, such as pages, tasks,
						and notes, is also stored on our servers.
					</p>

					<h2>2. How We Use Your Information</h2>
					<p>We use the information we collect to:</p>
					<ul>
						<li>Provide, maintain, and improve our Service;</li>
						<li>Process transactions and send you related information;</li>
						<li>
							Send you technical notices, updates, security alerts, and support
							messages;
						</li>
						<li>
							Communicate with you about products, services, offers, and events;
						</li>
						<li>
							Monitor and analyse trends, usage, and activities in connection
							with our Service.
						</li>
					</ul>

					<h2>3. Third-Party Services</h2>
					<p>
						We use third-party services to help us operate our Service. These
						include:
					</p>
					<ul>
						<li>
							<strong>Supabase:</strong> For database hosting, authentication,
							and backend services. Your data, including user account
							information and content, is stored with Supabase. You can view
							their privacy policy{" "}
							<a
								href="https://supabase.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
							>
								here
							</a>
							.
						</li>
						<li>
							<strong>Vercel:</strong> For hosting our web application. Vercel
							may collect analytics data as you interact with our site. You can
							view their privacy policy{" "}
							<a
								href="https://vercel.com/legal/privacy-policy"
								target="_blank"
								rel="noopener noreferrer"
							>
								here
							</a>
							.
						</li>
					</ul>

					<h2>4. Your Rights</h2>
					<p>
						You have certain rights regarding your personal information,
						including:
					</p>
					<ul>
						<li>
							The right to access, update, or correct your personal information.
						</li>
						<li>
							The right to request the deletion of your personal information.
							You can delete your account from the settings page, which will
							initiate the process of deleting your data from our systems.
						</li>
					</ul>

					<h2>5. Data Security</h2>
					<p>
						We take reasonable measures to help protect information about you
						from loss, theft, misuse, and unauthorised access, disclosure,
						alteration, and destruction.
					</p>

					<h2>6. Changes to This Policy</h2>
					<p>
						We may update this privacy policy from time to time. We will notify
						you of any changes by posting the new privacy policy on this page.
					</p>

					<h2>7. Contact Us</h2>
					<p>
						If you have any questions about this Privacy Policy, please{" "}
						<Link to="/contact">contact us</Link>.
					</p>

					<p className="text-sm text-muted-foreground mt-8 text-center italic">
						This is a template document. It is not legal advice. You should
						consult with a legal professional to ensure your Privacy Policy is
						compliant with all applicable laws and regulations.
					</p>
				</div>
			</div>
		</div>
	);
};

export default PrivacyPolicyPage;

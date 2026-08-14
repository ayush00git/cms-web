package services

import (
	"fmt"
	"log"
	"time"

	"github.com/ayush00git/cms-web/helpers"
	"github.com/wneessen/go-mail"
)

func SendMail(to, subject, body string) (error) {

	sender := helpers.GetEnv("SENDER_EMAIL")
	password := helpers.GetEnv("APP_PASSWORD")

	m := mail.NewMsg()
	m.From(sender)
	m.To(to)
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)

	c, err := mail.NewClient("smtp.gmail.com",
		mail.WithPort(587),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(sender),
		mail.WithPassword(password),
		mail.WithTLSPolicy(mail.TLSMandatory),
	)
	if err != nil {
		return err
	}

	return c.DialAndSend(m)
}

// buildEmailHTML builds the shared HTML email template used across all
// outgoing mails, so every mail shares the same look and feel.
func buildEmailHTML(heading, message, buttonText, buttonURL string) string {
	return fmt.Sprintf(`
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta name="color-scheme" content="light dark">
				<meta name="supported-color-schemes" content="light dark">
				<title>%s</title>
				<style>
					body, .bg { background-color: #ffffff; }
					.heading { color: #09090b; }
					.message { color: #52525b; }
					.button { background-color: #09090b; }
					.button-text { color: #ffffff; }
					.footer { border-top: 1px solid #f4f4f5; }
					.footer-text { color: #a1a1aa; }

					@media (prefers-color-scheme: dark) {
						body, .bg { background-color: #09090b !important; }
						.heading { color: #fafafa !important; }
						.message { color: #a1a1aa !important; }
						.button { background-color: #fafafa !important; }
						.button-text { color: #09090b !important; }
						.footer { border-top: 1px solid #27272a !important; }
						.footer-text { color: #71717a !important; }
					}
				</style>
			</head>
			<body class="bg" style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">

				<!-- Outer Wrapper -->
				<table border="0" cellpadding="0" cellspacing="0" width="100%%" class="bg" style="background-color: #ffffff; padding: 40px 20px;">
					<tr>
						<td align="center">

							<!-- Main Content Container -->
							<table border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 480px; text-align: left;">

								<!-- Main Body Content -->
								<tr>
									<td style="padding: 0 0 32px 0;">
										<h2 class="heading" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #09090b; letter-spacing: -0.02em;">
											%s
										</h2>
										<p class="message" style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #52525b;">
											%s
										</p>

										<!-- Call to Action Button -->
										<table border="0" cellpadding="0" cellspacing="0">
											<tr>
												<td align="center" class="button" style="border-radius: 6px; background-color: #09090b;">
													<a href="%s" target="_blank" class="button-text" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 6px;">
														%s
													</a>
												</td>
											</tr>
										</table>
									</td>
								</tr>

								<!-- Minimal Footer -->
								<tr>
									<td class="footer" style="padding: 20px 0 0 0; border-top: 1px solid #f4f4f5;">
										<p class="footer-text" style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa;">
											&copy; %d CMS. All rights reserved.
										</p>
									</td>
								</tr>

							</table>
							<!-- End Main Content -->

						</td>
					</tr>
				</table>

			</body>
			</html>
		`, heading, heading, message, buttonURL, buttonText, time.Now().Year())
}

// SendVerificationMail sends email to the user who just signed up
func SendVerificationMail(userId uint, email, role string) (error) {
	// generate the token
	token, err := helpers.GenerateToken(userId, email, role)
	if err != nil {
		return err
	}

	// create the verification url
	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	verificationURL := fmt.Sprintf(`%s/account/verify?token=%s`, frontendURL, token)

	// send the email
	mail := buildEmailHTML(
		"Verify your account",
		"Thanks for signing up! Get started with CMS.",
		"Verify Email Address",
		verificationURL,
	)

	err = SendMail(email, "Verification of your cms account", mail)
	if err != nil {
		return err
	}
	log.Printf("Account Verification Email sent to %s", email)
	return nil
}

// SendPasswordResetMail send an email to reset the password for an account
func SendPasswordResetMail(userID uint, email, role string) error {
	token, err := helpers.GenerateToken(userID, email, role)
	if err != nil {
		return err
	}
	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	resetURL := fmt.Sprintf(`%s/account/reset-password?user=%s`, frontendURL, token)

	// send the email
	mail := buildEmailHTML(
		"Reset your password",
		"We received a request to reset your password.",
		"Reset Password",
		resetURL,
	)

	err = SendMail(email, "Reset your cms account password", mail)
	if err != nil {
		return err
	}
	log.Printf("Password reset link sent to %s", email)
	return nil
}

func SendPostMailToAdmins(email, postURL string) error {
	mail := buildEmailHTML(
		"cms: updates on a recent complaint",
		"There has been an update on a complaint.",
		"View Updates",
		postURL,
	)

	// sends the email
	err := SendMail(email, "New complaint recieved", mail)
	if err != nil {
		return err
	}
	log.Printf("complaint mail was sent to %s", email)
	return nil
}

// Send email to peoples in the conversation thread expect the ignoreEmail
// one, to prevent sending the mail to user itself for its events
func SendMailToPeopleInThread(emails []string, ignoreEmail string, postURL string) error {
	mail := buildEmailHTML(
		"cms: updates on a recent complaint",
		"There has been an update on a complaint where you were mentioned.",
		"View Updates",
		postURL,
	)

	for _, email := range emails {
		if email == ignoreEmail {
			continue
		}
		if err := SendMail(email, "cms: updates on your recent complaint", mail); err != nil {		// if sending mail to one user fails don't abort for others
			log.Printf("failed sending mail to %s", email)
			continue
		}
		log.Printf("complaint was sent to %s\n", email)
	}
	return nil
}

package services

import (
	"fmt"
	"log"

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
	mail := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<style>
				body { font-family: sans-serif; line-height: 1.5; color: #333333; }
				.button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
			</style>
		</head>
		<body>
			<h2>Verifying it's you,</h2>
			<p>Thanks for signing up! get started with cms:</p>
			<p>
				<a href="%s" class="button" style="color: white;">Get Started!</a>
			</p>
		</body>
		</html>
		`, verificationURL)
	
	err = SendMail(email, "Verification of cms account", mail)
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
	mail := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<style>
				body { font-family: sans-serif; line-height: 1.5; color: #333333; }
				.button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
			</style>
		</head>
		<body>
			<h2>Reset your password</h2>
			<p>
				<a href="%s" class="button" style="color: white;">Reset!</a>
			</p>
		</body>
		</html>
		`, resetURL)

	err = SendMail(email, "Reset cms account password", mail)
	if err != nil {
		return err
	}
	log.Printf("Password reset link sent to %s", email)
	return nil
}

func SendPostMailToAdmins(email, postURL string) error {
	// send the email
	mail := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<style>
				body { font-family: sans-serif; line-height: 1.5; color: #333333; }
				.button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
			</style>
		</head>
		<body>
			<h2>Reset your password</h2>
			<p>
				<a href="%s" class="button" style="color: white;">Reset!</a>
			</p>
		</body>
		</html>
		`, postURL)

	err := SendMail(email, "New complaint recieved", mail)
	if err != nil {
		return err
	}
	log.Printf("complaint mail was sent to %s", email)
	return nil
}

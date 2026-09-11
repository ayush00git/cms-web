package services

import (
	"fmt"
	"log"

	"github.com/ayush00git/cms-web/helpers"
)

// SendProfileAccessMailToSuperAdmins mails a signed access link to the admin,
// completing the passwordless login when clicked.
func SendProfileAccessMailToSuperAdmins(adminID uint, email string) error {
	token, err := helpers.GenerateToken(adminID, email, "superadmin")
	if err != nil {
		return err
	}

	// create the access url
	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	accessURL := fmt.Sprintf(`%s/superadmin/access?token=%s`, frontendURL, token)

	mail := buildEmailHTML(
		"cms: get in to your super-admin account",
		"We received a request from you to get in.",
		"Get In",
		accessURL,
	)

	// sends the email
	err = SendMail(email, "Log in to your cms super-admin account", mail)
	if err != nil {
		return err
	}
	log.Printf("super admin access mail was sent to %s", email)
	return nil
}

// SendAccessMailToAssignedSuperAdmins mails a invited user to be a superadmin.
// (by default the invited one is set to superadmin, acceptance doesn't matters.)
func SendAccessMailToAssignedSuperAdmins(email string) error {
	// create the access url
	frontendURL := helpers.GetEnvWithDefault("FRONTEND_URL", "http://localhost:5173")
	accessURL := fmt.Sprintf(`%s/superadmin/login`, frontendURL)

	mail := buildEmailHTML(
		"cms: you have been invited to be a cms superadmin.",
		"Someone invited you to be a superadmin.",
		"Accept Invitation",
		accessURL,
	)

	// sends the email
	err := SendMail(email, "Invitation to be a cms superadmin.", mail)
	if err != nil {
		return err
	}
	log.Printf("new super admin invitation mail was sent to %s", email)
	return nil
}


package services

import (
	"fmt"
)

// SendStatusEmail is a stub service that mocks sending emails at every stage
// In a production environment, this would integrate with an SMTP server or an email service provider
func SendStatusEmail(to string, subject string, body string) {
	fmt.Println("======================================")
	fmt.Println("MOCK EMAIL DISPATCH")
	fmt.Printf("To:      %s\n", to)
	fmt.Printf("Subject: %s\n", subject)
	fmt.Printf("Body:    %s\n", body)
	fmt.Println("======================================")
}

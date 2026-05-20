package services

import (
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

	return c.DialAndSend()
}

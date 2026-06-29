package helpers


// AppendUnique is a helper method which acts as a corollary
// to the `.append` method of strings and avoids storing
// duplicate emails to the PersonInThread slice
// restoring the set property.
func AppendUnique(emails []string, email string) []string {
	for _, e := range emails {
		if email == e {
			return emails;
		}
	}
	return append(emails, email)
}

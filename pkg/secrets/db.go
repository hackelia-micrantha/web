package secrets

import (
	"errors"
	"net/url"
	"os"
)

var (
	ErrDatabaseUrlMissing    = errors.New("DATABASE_URL environment variable not defined")
	ErrDatabaseSecretMissing = errors.New("DATABASE_SECRET_FILE environment variable not defined")
)

func DatabaseURL() (*url.URL, error) {
	connStr, exists := os.LookupEnv("DATABASE_URL")

	if !exists {
		return nil, ErrDatabaseUrlMissing
	}

	connURL, err := url.Parse(connStr)

	if err != nil {
		return nil, err
	}

	pwd, err := GetFromEnv("DATABASE_SECRET_FILE")

	if err == nil {
		connURL.User = url.UserPassword(connURL.User.Username(), pwd)
		return connURL, nil
	}

	return connURL, ErrDatabaseSecretMissing
}

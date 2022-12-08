// Package secrets for managing docker and environment secrets with database urls
package secrets

import (
	"errors"
	"net/url"
	"os"
)

var (
	// ErrDatabaseURLMissing when no database url provided
	ErrDatabaseURLMissing = errors.New("DATABASE_URL environment variable not defined")
	// ErrDatabaseSecretMissing when no secret
	ErrDatabaseSecretMissing = errors.New("DATABASE_SECRET_FILE environment variable not defined")
)

// DatabaseURL gets the database url from the environment and applies secrets
//
//	Looks for 'DATABASE_URL' and 'DATABASE_SECRET' environment variables
func (secrets Secrets) DatabaseURL() (*url.URL, error) {
	connStr, exists := os.LookupEnv("DATABASE_URL")

	if !exists {
		return nil, ErrDatabaseURLMissing
	}

	connURL, err := url.Parse(connStr)

	if err != nil {
		return nil, err
	}

	pwd, err := secrets.Lookup("DATABASE_SECRET")

	if err == nil {
		connURL.User = url.UserPassword(connURL.User.Username(), pwd)
		return connURL, nil
	}

	return connURL, ErrDatabaseSecretMissing
}

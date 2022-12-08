package secrets

import (
	"os"

	"micrantha.com/web.git/pkg/secrets/dir"
)

// Storage interfaces with systems that store a secret
type Storage interface {
	Get(string) (string, error)
}

// Secrets is an implementation of a secrets store
type Secrets struct {
	storage Storage
	handle  string
}

func (secrets Secrets) String() string {
	return secrets.handle
}

// NewDirectorySecrets creates an instance to read secrets from a directory
func NewDirectorySecrets(path string) *Secrets {
	return &Secrets{
		storage: dir.New(path),
		handle:  path,
	}
}

// Get reads the secret from the storage
func (secrets Secrets) Get(handle string) (string, error) {
	return secrets.storage.Get(handle)
}

// Lookup attempts to read a secret from an environment variable
func (secrets Secrets) Lookup(handle string) (string, error) {

	value, ok := os.LookupEnv(handle)

	if ok {
		return secrets.storage.Get(value)
	}

	return secrets.storage.Get(handle)
}

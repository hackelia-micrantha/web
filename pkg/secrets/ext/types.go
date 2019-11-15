package ext

import "fmt"

// Type is a type of secret extension
type Type int

const (
	// Password is a secure password secret type (64 bytes+)
	Password Type = iota
	// Key is a secure key type (20 bytes)
	Key
	// Text is larger secure content
	Text
)

func (t Type) String() string {
	return fmt.Sprint(".", t.Name())
}

// Name returns the name of the extension type
func (t Type) Name() string {
	return [...]string{"pwd", "key", "txt"}[t]
}

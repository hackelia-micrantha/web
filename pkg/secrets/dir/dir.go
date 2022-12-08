// Package dir for secrets in files
package dir

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// Directory is the storage type
type Directory string

// New creates a new file secret location
func New(directory string) Directory {
	return Directory(directory)
}

func (dir Directory) String() string {
	return string(dir)
}

func (dir Directory) validateSecret(filePath string) string {
	if strings.HasPrefix(filePath, dir.String()) || filepath.IsAbs(filePath) {
		return filePath
	}

	return filepath.Join(dir.String(), filePath)
}

func (dir Directory) readSecretToString(filePath string) (string, error) {

	fp, err := os.Open(filePath)

	if err != nil {
		return "", err
	}

	defer fp.Close()

	data, err := ioutil.ReadAll(fp)

	if err != nil {
		return "", err
	}

	return strings.TrimSpace(string(data)), nil
}

// Get returns the secret from a file
func (dir Directory) Get(fileName string) (string, error) {

	filePath := dir.validateSecret(fileName)

	return dir.readSecretToString(filePath)
}

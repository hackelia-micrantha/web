package secrets

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"micrantha.com/micrantha/web.git/pkg/secrets/ext"
)

type secretStorage interface {
	getSecret(string) (string, error)
	envSecret(string) (string, error)
}

type fileSecretStorage string

const dockerSecrets fileSecretStorage = "/run/secrets"

var defaultStorage = dockerSecrets

func (storage fileSecretStorage) String() string {
	return string(storage)
}

func (storage fileSecretStorage) validateSecret(filePath string) (string, error) {
	if strings.HasPrefix(filePath, storage.String()) {
		return filePath, nil
	}

	rel, err := filepath.Rel(storage.String(), filePath)

	if err == nil {
		return filepath.Join(storage.String(), rel), nil
	}

	return filepath.Join(storage.String(), filePath), nil
}

func (storage fileSecretStorage) readSecretToString(filePath string) (string, error) {

	file, err := os.Open(filePath)

	if err != nil {
		return "", err
	}

	defer file.Close()

	data, err := ioutil.ReadAll(file)

	if err != nil {
		return "", err
	}

	return string(data), nil
}

func (storage fileSecretStorage) getSecret(fileName string) (string, error) {

	filePath, err := storage.validateSecret(fileName)

	if err != nil {
		return filePath, err
	}

	return storage.readSecretToString(filePath)
}

func (storage fileSecretStorage) envSecret(key string) (string, error) {

	fileName, ok := os.LookupEnv(key)

	if ok {
		return "", errors.New(key + " not found")
	}

	return storage.getSecret(fileName)
}

// GetFromEnv reads a file defined in an environment key value
func GetFromEnv(key string) (string, error) {
	return defaultStorage.envSecret(key)
}

// GetType attempts to find a secret based on a name and type
//     assumes the format /run/secret/<name>.<type>
func GetType(name string, secretType ext.Type) (string, error) {
	return Get(fmt.Sprint(name, secretType))
}

// Get attempts to read a secret from a file name
func Get(fileName string) (string, error) {
	return defaultStorage.getSecret(fileName)
}

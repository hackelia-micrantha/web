package secrets

import (
	"errors"
	"io/ioutil"
	"os"
)

func readFileToString(fileName string) (string, error) {

	file, err := os.Open(fileName)

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

// ReadEnvFile reads a file defined in an environment key value
func ReadEnvFile(key string) (string, error) {
	fileName, ok := os.LookupEnv(key)

	if ok {
		return "", errors.New(key + " not found")
	}

	return readFileToString(fileName)
}

// DatabasePassword reads the file specified by DATABASE_PASSWORD_FILE
func DatabasePassword() (string, error) {

	return ReadEnvFile("DATABASE_PASSWORD_FILE")
}

package secrets

import (
	"os"
	"path/filepath"
	"testing"

	"micrantha.com/micrantha/web.git/pkg/secrets/ext"
)

const testSecrets fileSecretStorage = "../../test/secrets"

func init() {
	defaultStorage = testSecrets
}

func TestGet(t *testing.T) {

	expected := "test1ng"

	actual, err := Get("test.pwd")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func TestGetType(t *testing.T) {
	expected := "test1ng"

	actual, err := GetType("test", ext.Password)

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func TestGetFromEnvRelative(t *testing.T) {
	expected := "test1ng"

	os.Setenv("TEST_PWD_FILE", "test.pwd")

	actual, err := GetFromEnv("TEST_PWD_FILE")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func TestGetFromEnvAbsolute(t *testing.T) {
	expected := "test1ng"

	filePath, err := filepath.Abs(filepath.Join(defaultStorage.String(), "test.pwd"))

	if err != nil {
		t.Fatal("Unable to find absolute path for test")
	}

	os.Setenv("TEST_PWD_FILE", filePath)

	actual, err := GetFromEnv("TEST_PWD_FILE")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func TestGetFromEnvEmpty(t *testing.T) {
	_, err := GetFromEnv("RANDOM_ENV_VAR")

	if err == nil {
		t.Fatal("Expected error from non-existing env var secret")
	}
}

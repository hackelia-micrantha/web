package secrets

import (
	"os"
	"path/filepath"
	"testing"
)

var testSecrets = NewDirectorySecrets("../../test/secrets")

func TestGet(t *testing.T) {

	expected := "test1ng"

	actual, err := testSecrets.Get("test.pwd")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func TestLookupRelative(t *testing.T) {
	expected := "test1ng"

	os.Setenv("TEST_PWD_FILE", "test.pwd")

	actual, err := testSecrets.Lookup("TEST_PWD_FILE")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func TestLookupAbsolute(t *testing.T) {
	expected := "test1ng"

	filePath, err := filepath.Abs(filepath.Join(testSecrets.String(), "test.pwd"))

	if err != nil {
		t.Fatal("Unable to find absolute path for test")
	}

	os.Setenv("TEST_PWD_FILE", filePath)

	actual, err := testSecrets.Lookup("TEST_PWD_FILE")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func TestLookupEmpty(t *testing.T) {
	_, err := testSecrets.Lookup("RANDOM_ENV_VAR")

	if err == nil {
		t.Fatal("Expected error from non-existing env var secret")
	}
}

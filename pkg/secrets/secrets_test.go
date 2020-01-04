package secrets

import (
	"os"
	"testing"

	"micrantha.com/micrantha/web.git/pkg/secrets/ext"
)

const testSecrets fileSecretStorage = "./test/secrets"

func init() {
	defaultStorage = testSecrets
}

func testGet(t *testing.T) {

	expected := "test1ng"

	actual, err := Get("test.pwd")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func testGetType(t *testing.T) {
	expected := "test1ng"

	actual, err := GetType("test", ext.Password)

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

func testGetNameFromEnv(t *testing.T) {
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

func testGetPathFromEnv(t *testing.T) {
	expected := "test1ng"

	os.Setenv("TEST_PWD_FILE", "/run/secrets/test.pwd")

	actual, err := GetFromEnv("TEST_PWD_FILE")

	if err != nil {
		t.Fatal(err)
	}

	if actual != expected {
		t.Fatal("expected ", expected, " got ", actual)
	}
}

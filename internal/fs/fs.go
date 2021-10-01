package fs

import (
	"os"
	"path/filepath"
)

func GetTemplatePath() string {
	t, ok := os.LookupEnv("MICRANTHA_TEMPLATE_PATH")

	if !ok {
		return filepath.Join("web", "template")
	}
	return t
}

func GetPublicPath() string {
	filePath, ok := os.LookupEnv("MICRANTHA_PUBLIC_PATH")

	if !ok {
		return filepath.Join("web", "public")
	}
	return filePath
}

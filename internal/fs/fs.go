package fs

import (
	"os"
	"path/filepath"

	"micrantha.com/web.git/pkg/config"
)

var (
	TemplatePath string
	PublicPath   string
)

func GetTemplatePath() (string, bool) {
	t, ok := os.LookupEnv("MICRANTHA_TEMPLATE_PATH")

	if !ok {
		return filepath.Join("web", "template"), ok
	}
	return t, ok
}

func GetPublicPath() (string, bool) {
	filePath, ok := os.LookupEnv("MICRANTHA_PUBLIC_PATH")

	if !ok {
		return filepath.Join("web", "public"), ok
	}
	return filePath, ok
}

func SetPaths(config *config.Config) {
	path, ok := GetTemplatePath()
	if !ok && len(config.TemplatePath) > 0 {
		TemplatePath = config.TemplatePath
	} else {
		TemplatePath = path
	}

	path, ok = GetPublicPath()
	if !ok && len(config.PublicPath) > 0 {
		PublicPath = config.PublicPath
	} else {
		PublicPath = path
	}
}

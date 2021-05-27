package main

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"micrantha.com/web.git/internal/endpoint"
	"micrantha.com/web.git/pkg/render"
)

func main() {

	outputDir := filepath.Join("web", "public")

	err := filepath.WalkDir("web/template", func(path string, d fs.DirEntry, err error) error {

		if path[0] == '_' || d.Name()[0] == '_' {
			return filepath.SkipDir
		}

		if d.IsDir() {
			return os.MkdirAll(filepath.Join(outputDir, path), 0770)
		}

		destPath := filepath.Join(outputDir, strings.TrimSuffix(path, filepath.Ext(d.Name())))

		fmt.Fprintln(os.Stderr, "Generating", destPath)
		f, err := os.OpenFile(destPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0600)

		if err != nil {
			return err
		}

		defer func() {
			_ = f.Close()
		}()

		return render.Template(f, d.Name(), endpoint.Params)

	})

	if err != nil {
		panic(err)
	}
}
package generate

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"micrantha.com/web.git/internal/endpoint"
	internal "micrantha.com/web.git/internal/fs"
	"micrantha.com/web.git/pkg/render"
)

func Templates() error {

	internal.SetPaths(endpoint.Config)
	outputDir := internal.PublicPath

	inputDir := internal.TemplatePath

	return filepath.WalkDir(inputDir, func(path string, d fs.DirEntry, err error) error {

		if path[0] == '_' || d.Name()[0] == '_' {
			return filepath.SkipDir
		}

		filename := strings.TrimPrefix(path, inputDir)

		if d.IsDir() {
			return os.MkdirAll(filepath.Join(outputDir, filename), 0770)
		}

		destPath := filepath.Join(outputDir, strings.TrimSuffix(filename, filepath.Ext(d.Name())))

		fmt.Fprintln(os.Stderr, "Generating", destPath)
		f, err := os.OpenFile(destPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0600)

		if err != nil {
			return err
		}

		defer func() {
			_ = f.Close()
		}()

		return render.Template(f, filename, endpoint.Params)

	})
}

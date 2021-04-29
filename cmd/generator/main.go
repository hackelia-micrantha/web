package main

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"micrantha.com/web.git/internal/endpoint"
	"micrantha.com/web.git/pkg/render"
)

func main() {

	excludes := []*regexp.Regexp{
		regexp.MustCompile("layout.html.tmpl"),
		regexp.MustCompile("partials/*"),
	}

	err := filepath.WalkDir("web/template", func(path string, d fs.DirEntry, err error) error {

		if d.IsDir() {
			return nil
		}

		for _, ex := range excludes {
			if ex.MatchString(path) {
				return nil
			}
		}

		destPath := filepath.Join("web", "public", strings.TrimSuffix(d.Name(), filepath.Ext(d.Name())))

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
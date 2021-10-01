package main

import (
	"micrantha.com/web.git/internal/endpoint"
	"micrantha.com/web.git/internal/fs"
	"micrantha.com/web.git/pkg/generate"
)

func main() {

	fs.SetPaths(endpoint.Config)

	err := generate.Templates(fs.TemplatePath, fs.PublicPath, nil)

	if err != nil {
		panic(err)
	}
}

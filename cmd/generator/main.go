package main

import (
	"micrantha.com/web.git/internal/endpoint"
	"micrantha.com/web.git/pkg/generate"
)

func main() {

	err := generate.Templates(endpoint.Params)

	if err != nil {
		panic(err)
	}
}

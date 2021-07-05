package main

import "micrantha.com/web.git/pkg/generate"

func main() {

	err := generate.Templates()

	if err != nil {
		panic(err)
	}
}
package main

import "micrantha.com/web.git/internal/generate"

func main() {

	err := generate.Templates()

	if err != nil {
		panic(err)
	}
}
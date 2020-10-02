package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path"

	"micrantha.com/web.git/internal/endpoint"
	"micrantha.com/web.git/pkg/route"
)

var (
	version     string
	port        = flag.Int("port", 1337, "The port the web server listens on")
	showVersion = false
)

func main() {
	if len(version) > 0 {
		flag.BoolVar(&showVersion, "version", false, "display the version")
	}

	flag.Parse()

	if showVersion {
		fmt.Println(version)
		os.Exit(1)
	}

	router := route.New(endpoint.List, endpoint.Config)

	log.Printf("%s service listening on %d", path.Base(os.Args[0]), *port)

	log.Fatal(serve(router, *port))
}

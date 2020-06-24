package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"micrantha.com/web.git/internal/pkg/endpoint"
	"micrantha.com/web.git/pkg/route"
)

var (
	version string
	port    = flag.Int("port", 1337, "The port the web server listens on")
)

func main() {

	flag.Parse()

	if flag.NArg() > 0 {
		execute(flag.Args())
	}

	router := route.New(endpoint.List)

	log.Printf("%s service listening on %d", path.Base(os.Args[0]), *port)

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), router))
}

func execute(args []string) {

	cmd, args := strings.ToLower(args[0]), args[1:]

	switch cmd {
	case "version":
		fmt.Println(version)
		os.Exit(0)
	}
}

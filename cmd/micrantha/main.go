package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"micrantha.com/web/internal/pkg/endpoint"
	"micrantha.com/web/pkg/route"
)

var (
	port = flag.Int("port", 1337, "The port the web server listens on")
)

func main() {

	flag.Parse()

	router := route.New(endpoint.List)

	log.Printf("%s service listening on %d", os.Args[0], *port)

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), router))
}

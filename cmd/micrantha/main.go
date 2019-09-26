package main

import (
	"flag"
	"fmt"
	"log"
	"micrantha.com/internal/pkg/endpoint"
	"micrantha.com/pkg/route"
	"net/http"
	"os"
)

var (
	port = flag.Int("port", 1337, "The port the web server listens on")
)
func main() {

	router := route.New(endpoint.List)

	log.Printf("%s service listening on %d", os.Args[0], *port)

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), router))
}

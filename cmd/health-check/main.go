package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
)

var (
	port int
)

func init() {
	flag.IntVar(&port, "port", 1337, "the port to connect on")
}

func main() {
	flag.Parse()

	p, ok := os.LookupEnv("PORT")

	if ok {
		i, err := strconv.ParseInt(p, 10, 32)
		if err != nil {
			port = int(i)
		}
	}

	resp, err := http.Get(fmt.Sprintf("http://localhost:%d", port))

	if err != nil || resp.StatusCode != 200 {
		os.Exit(1)
	}

	// TODO: check integrity

	os.Exit(0)
}

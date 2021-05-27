// +build ssl

package main

import (
	"flag"
	"fmt"
	"net/http"
)

var (
	certFile string
	keyFile  string
)

func init() {
	flag.StringVar(&certFile, "cert-file", "test/certs/dev.pem", "sets the server certificate")
	flag.StringVar(&keyFile, "key-file", "test/certs/dev-key.pem", "sets the server certificate key file")
}

// Serve in development we generate self-signed certs to test https
func serve(router http.Handler, port int) error {
	return http.ListenAndServeTLS(fmt.Sprintf(":%d", port), certFile, keyFile, router)
}

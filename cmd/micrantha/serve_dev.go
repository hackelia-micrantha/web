// +build dev

package main

import (
	"fmt"
	"net/http"
)

// Serve in development we generate self-signed certs to test https
func serve(router http.Handler, port int) error {
	return http.ListenAndServeTLS(fmt.Sprintf(":%d", port), "test/micrantha.test.pem", "test/micrantha.test-key.pem",
		router)
}

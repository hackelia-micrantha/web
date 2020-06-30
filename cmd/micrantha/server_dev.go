// +build dev

package main

import (
	"fmt"
	"net/http"
)

// Serve the web
func Serve(router http.Handler, port int) error {
	return http.ListenAndServeTLS(fmt.Sprintf(":%d", port),
		"test/micrantha.test.pem", "test/micrantha.test-key.pem",
		router)
}

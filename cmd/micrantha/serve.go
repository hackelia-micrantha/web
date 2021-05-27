// +build !ssl

package main

import (
	"fmt"
	"net/http"
)

// Serve in production the TLS is handled by the proxy
func serve(router http.Handler, port int) error {
	return http.ListenAndServe(fmt.Sprintf(":%d", port), router)
}

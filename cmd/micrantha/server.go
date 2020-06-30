// +build !dev

package main

import (
	"fmt"
	"net/http"
)

// Serve the web
func Serve(router http.Handler, port int) error {

	return http.ListenAndServe(fmt.Sprintf(":%d", port), router)
}

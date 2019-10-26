// +build !embed

package main

import (
	"github.com/omeid/go-resources/live"
)

// Template is a live resource directory
var Template = live.Dir("./web/template")

// Website is a live resource directory
var Website = live.Dir("./website")

// +build !embed

package main

import (
	"github.com/omeid/go-resources/live"
)

var Template = live.Dir("./web/template")
var Website = live.Dir("./website")

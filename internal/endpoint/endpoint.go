package endpoint

import (
	"micrantha.com/web.git/pkg/route"
	"micrantha.com/web.git/pkg/security/csp"
)

var Params = map[string]interface{}{
	"Title":       "Micrantha",
	"Description": "a software as a service and consulting company.",
	"Keywords":    "sass, software, company, service",
	"BrandName":   "Micrantha",
	"BrandUrl":    "https://micrantha.com",
}

var Config = &route.Config{
	ContentPolicy: &csp.ContentPolicy{
		Script:   csp.WithSelf("analytics.micrantha.com"),
		Img:      csp.WithSelf("fortunes.micrantha.com", "analytics.micrantha.com", "veil.micrantha.com"),
		Style:    csp.WithSelf("fonts.googleapis.com"),
		Font:     csp.WithSelf("fonts.googleapis.com"),
		Manifest: csp.Self,
	},
	PublicPath: "./web/public",
}

// List is a list of defined route endpoints
var List = route.Routes{}

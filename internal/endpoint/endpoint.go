package endpoint

import (
	"net/http"

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
var List = route.Routes{
	route.Type{
		Name:        "HomeRoute",
		Method:      http.MethodGet,
		Pattern:     "/",
		HandlerFunc: route.File("home.html", Params),
	},
	route.Type{
		Name:        "SolutionsRoute",
		Method:      http.MethodGet,
		Pattern:     "/solutions",
		HandlerFunc: route.File("solutions.html", Params),
	},
	route.Type{
		Name:        "PhilosophyRoute",
		Method:      http.MethodGet,
		Pattern:     "/philosophy",
		HandlerFunc: route.File("philosophy.html", Params),
	},
	route.Type{
		Name:        "CareersRoute",
		Method:      http.MethodGet,
		Pattern:     "/careers",
		HandlerFunc: route.File("careers.html", Params),
	},
	route.Type{
		Name:        "LaboratoryRoute",
		Method:      http.MethodGet,
		Pattern:     "/laboratory",
		HandlerFunc: route.File("laboratory.html", Params),
	},
	route.Type{
		Name:        "CompostRoute",
		Method:      http.MethodGet,
		Pattern:     "/laboratory/compost",
		HandlerFunc: route.File("compost.html", Params),
	},
	route.Type{
		Name:        "PrivacyRoute",
		Method:      http.MethodGet,
		Pattern:     "/privacy",
		HandlerFunc: route.File("privacy.html", Params),
	},
	route.Type{
		Name:        "SupportRoute",
		Method:      http.MethodGet,
		Pattern:     "/support",
		HandlerFunc: route.File("support.html", Params),
	},
	route.Type{
		Name:        "BlogGardenRoute",
		Method:      http.MethodGet,
		Pattern:     "/blog/garden",
		HandlerFunc: route.File("garden.html", Params),
	},
}

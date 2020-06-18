package endpoint

import (
	"net/http"

	"micrantha.com/web.git/pkg/route"
)

var defaultParams = map[string]interface{}{
	"Title":       "Micrantha",
	"Description": "a software as a service and consulting company.",
	"Keywords":    "sass, software, company, service",
	"BrandName":   "Micrantha",
	"BrandUrl":    "https://micrantha.com",
}

// List is a list of defined route endpoints
var List = route.Routes{
	route.Type{
		Name:        "HomeRoute",
		Method:      http.MethodGet,
		Pattern:     "/",
		HandlerFunc: route.Template("home.html", defaultParams),
	},
	route.Type{
		Name:        "SolutionsRoute",
		Method:      http.MethodGet,
		Pattern:     "/solutions",
		HandlerFunc: route.Template("solutions.html", defaultParams),
	},
	route.Type{
		Name:        "PhilosophyRoute",
		Method:      http.MethodGet,
		Pattern:     "/philosophy",
		HandlerFunc: route.Template("philosophy.html", defaultParams),
	},
	route.Type{
		Name:        "EmploymentRoute",
		Method:      http.MethodGet,
		Pattern:     "/employment",
		HandlerFunc: route.Template("employment.html", defaultParams),
	},
	route.Type{
		Name:        "LabratoryRoute",
		Method:      http.MethodGet,
		Pattern:     "/labratory",
		HandlerFunc: route.Template("labratory.html", defaultParams),
	},
	route.Type{
		Name:        "PrivacyRoute",
		Method:      http.MethodGet,
		Pattern:     "/privacy",
		HandlerFunc: route.Template("privacy.html", defaultParams),
	},
	route.Type{
		Name:        "SupportRoute",
		Method:      http.MethodGet,
		Pattern:     "/support",
		HandlerFunc: route.Template("support.html", defaultParams),
	},
}

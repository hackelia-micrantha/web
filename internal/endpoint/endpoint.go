package endpoint

import (
	"net/http"

	"micrantha.com/web.git/pkg/route"
	"micrantha.com/web.git/pkg/security/csp"
)

var defaultParams = map[string]interface{}{
	"Title":       "Micrantha",
	"Description": "a software as a service and consulting company.",
	"Keywords":    "sass, software, company, service",
	"BrandName":   "Micrantha",
	"BrandUrl":    "https://micrantha.com",
}

var Config = &route.Config{
	ContentPolicy: &csp.ContentPolicy{
		Script:   csp.WithSelf("analytics.micrantha.com"),
		Img:      csp.WithSelf("fortunes.micrantha.com", "analytics.micrantha.com"),
		Style:    csp.WithSelf("fonts.googleapis.com"),
		Font:     csp.WithSelf("fonts.googleapis.com"),
		Manifest: csp.Self,
	},
}

// List is a list of defined route endpoints
var List = route.Routes{
	route.Type{
		Name:        "HomeRoute",
		Method:      http.MethodGet,
		Pattern:     "/",
		HandlerFunc: route.Template("home.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "SolutionsRoute",
		Method:      http.MethodGet,
		Pattern:     "/solutions",
		HandlerFunc: route.Template("solutions.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "PhilosophyRoute",
		Method:      http.MethodGet,
		Pattern:     "/philosophy",
		HandlerFunc: route.Template("philosophy.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "CareersRoute",
		Method:      http.MethodGet,
		Pattern:     "/careers",
		HandlerFunc: route.Template("careers.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "LabratoryRoute",
		Method:      http.MethodGet,
		Pattern:     "/labratory",
		HandlerFunc: route.Template("labratory.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "CompostRoute",
		Method:      http.MethodGet,
		Pattern:     "/labratory/compost",
		HandlerFunc: route.Template("compost.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "PrivacyRoute",
		Method:      http.MethodGet,
		Pattern:     "/privacy",
		HandlerFunc: route.Template("privacy.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "SupportRoute",
		Method:      http.MethodGet,
		Pattern:     "/support",
		HandlerFunc: route.Template("support.html.tmpl", defaultParams),
	},
	route.Type{
		Name:        "BlogGardenRoute",
		Method:      http.MethodGet,
		Pattern:     "/blog/garden",
		HandlerFunc: route.Template("garden.html.tmpl", defaultParams),
	},
}

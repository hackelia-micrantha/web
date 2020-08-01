package endpoint

import (
	"net/http"

	"micrantha.com/web.git/pkg/render"
	"micrantha.com/web.git/pkg/route"
)

// List is a list of defined route endpoints
var List = route.Routes{
	route.Type{
		Name:        "HomeRoute",
		Method:      http.MethodGet,
		Pattern:     "/",
		HandlerFunc: route.Template("home.tmpl", render.DefaultParams),
	},
	route.Type{
		Name:        "SolutionsRoute",
		Method:      http.MethodGet,
		Pattern:     "/solutions",
		HandlerFunc: route.Template("solutions.tmpl", render.DefaultParams),
	},
	route.Type{
		Name:        "PhilosophyRoute",
		Method:      http.MethodGet,
		Pattern:     "/philosophy",
		HandlerFunc: route.Template("philosophy.tmpl", render.DefaultParams),
	},
	route.Type{
		Name:        "CareersRoute",
		Method:      http.MethodGet,
		Pattern:     "/careers",
		HandlerFunc: route.Template("careers.tmpl", render.DefaultParams),
	},
	route.Type{
		Name:        "LabratoryRoute",
		Method:      http.MethodGet,
		Pattern:     "/labratory",
		HandlerFunc: route.Template("labratory.tmpl", render.DefaultParams),
	},
	route.Type{
		Name:        "LabFailsRoute",
		Method:      http.MethodGet,
		Pattern:     "/labratory/failures",
		HandlerFunc: route.Template("lab-fails.tmpl", render.DefaultParams),
	},
	route.Type{
		Name:        "PrivacyRoute",
		Method:      http.MethodGet,
		Pattern:     "/privacy",
		HandlerFunc: route.Template("privacy.tmpl", render.DefaultParams),
	},
	route.Type{
		Name:        "SupportRoute",
		Method:      http.MethodGet,
		Pattern:     "/support",
		HandlerFunc: route.Template("support.tmpl", render.DefaultParams),
	},
}

package route

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"micrantha.com/web.git/pkg/render"
)

// Type is a route type
type Type struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

// Routes is a list a route types
type Routes []Type

// New allocates a new router for use with an http server
func New(routes Routes) *mux.Router {
	router := mux.NewRouter().StrictSlash(true)

	for _, route := range routes {
		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(route.HandlerFunc)
	}

	router.Use(security)
	//router.Use(logger)
	//router.Use(mux.CORSMethodMiddleware(router))

	filePath, ok := os.LookupEnv("MICRANTHA_PUBLIC_PATH")

	if !ok {
		filePath = "./website"
	}

	router.PathPrefix("/").Handler(http.FileServer(http.Dir(filePath)))

	return router
}

// Template returns an handler that renders a template
func Template(name string, params interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		err := render.Template(w, name, params)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
	}
}

func security(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Content-Security-Policy", "default-src 'self' *.cloudflare.com *.micrantha.com")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		if next != nil {
			next.ServeHTTP(w, r)
		}
	})
}

func logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		log.Printf(
			"%s %s %s",
			r.Method,
			r.RequestURI,
			r.RemoteAddr,
		)

		if next != nil {
			next.ServeHTTP(w, r)
		}
	})
}

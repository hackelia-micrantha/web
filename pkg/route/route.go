package route

import (
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/handlers"
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
	router.Use(logger)
	router.Use(handlers.RecoveryHandler())
	router.Use(handlers.CompressHandler)

	filePath, ok := os.LookupEnv("MICRANTHA_PUBLIC_PATH")

	if !ok {
		filePath = "./web/public"
	}

	router.PathPrefix("/").Handler(caching(http.FileServer(http.Dir(filePath))))

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

	allowedHosts := os.Getenv("MICRANTHA_ALLOWED_HOSTS")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Content-Security-Policy", "default-src 'self' data: *.cloudflare.com *.micrantha.com fonts.googleapis.com fonts.gstatic.com "+allowedHosts)
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		if next != nil {
			next.ServeHTTP(w, r)
		}
	})
}

func cachingEnabled() bool {

	nocache, ok := os.LookupEnv("MICRANTHA_NO_CACHE")

	if !ok {
		return true
	}

	value, err := strconv.ParseBool(nocache)

	if err != nil {
		return false
	}

	return value
}
func caching(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if cachingEnabled() {
			w.Header().Add("Cache-Control", "public, max-age=31536000")
		} else {
			w.Header().Add("Cache-Control", "no-cache, no-store, must-revalidate")
			w.Header().Add("Pragma", "no-cache")
			w.Header().Add("Expires", "0")
		}

		if next != nil {
			next.ServeHTTP(w, r)
		}
	})
}

func logger(next http.Handler) http.Handler {
	return handlers.LoggingHandler(os.Stdout, next)
}

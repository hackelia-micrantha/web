package route

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	internal "micrantha.com/web.git/internal/route"
	"micrantha.com/web.git/pkg/render"
	"micrantha.com/web.git/pkg/security/csp"
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

type Config struct {
	ContentPolicy *csp.ContentPolicy
	PublicPath    string
}

type spaHandler struct {
}

func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path, err := filepath.Abs(r.URL.Path)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	path = filepath.Join(internal.PublicPath, path)

	_, err = os.Stat(path)

	if os.IsNotExist(err) {
		http.ServeFile(w, r, filepath.Join(internal.PublicPath, "index.html"))
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.FileServer(http.Dir(internal.PublicPath)).ServeHTTP(w, r)
}

func NewSinglePageApp(routes Routes, config *Config) *mux.Router {
	return newRouter(routes, config, spaHandler{})
}

func New(routes Routes, config *Config) *mux.Router {
	return newRouter(routes, config, http.FileServer(http.Dir(internal.PublicPath)))
}

// New allocates a new router for use with an http server
func newRouter(routes Routes, config *Config, handler http.Handler) *mux.Router {
	router := mux.NewRouter().StrictSlash(true)

	for _, route := range routes {
		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(route.HandlerFunc)
	}

	filePath, ok := os.LookupEnv("MICRANTHA_PUBLIC_PATH")

	if !ok {
		if len(config.PublicPath) > 0 {
			filePath = config.PublicPath
		} else {
			filePath = "./web/public"
		}
	}

	internal.PublicPath = filePath

	router.Use(security)
	router.Use(logger)
	router.Use(handlers.CORS())
	router.Use(config.ContentPolicy.Middleware)
	router.Use(handlers.RecoveryHandler())
	router.Use(handlers.CompressHandler)

	router.PathPrefix("/").Handler(caching(handler))

	return router
}

// Template returns an handler that renders a template
func Template(name string, params interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		err := render.Template(w, name, params)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}

func File(name string, params interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(internal.PublicPath, name))
	}
}

func security(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("X-XSS-Protection", "1; mode=block")

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

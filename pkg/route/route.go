package route

import (
	"github.com/gorilla/mux"
	"log"
	"micrantha.com/pkg/render"
	"net/http"
	"os"
	"time"
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
		handler := logger(route.HandlerFunc, route.Name)

		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(handler)
	}

	filePath, ok := os.LookupEnv("PUBLIC_FOLDER_PATH")

	if !ok {
		filePath = "./website"
	}

	router.PathPrefix("/").Handler(http.FileServer(http.Dir(filePath)))

	return router
}

// Template returns an handler that renders a template
func Template(name string, params interface{}) http.HandlerFunc {
	return func (w http.ResponseWriter, _ *http.Request) {
		err := render.Template(w, name, params)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
	}
}

func logger(inner http.Handler, name string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		inner.ServeHTTP(w, r)

		log.Printf(
			"%s %s %s %s %s %s",
			r.Method,
			r.RequestURI,
			name,
			time.Since(start),
			r.RemoteAddr,
			r.Header.Get("X-Forwarded-For"),
		)
	})
}


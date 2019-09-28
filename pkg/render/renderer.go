package render

import (
	"encoding/json"
	"errors"
	"html/template"
	"mime"
	"net/http"
	"os"
	"path"
	"strings"
)

// FormatType is a type of response formatting
type FormatType int

const (
	// FormatJSON is a JSON rendering type
	FormatJSON FormatType = iota
	// FormatText is a text rendering type
	FormatText
	// FormatNone indicates no rendering type
	FormatNone
)
var (
	templates = make(map[string]*template.Template)
	templatePath string
)

func init() {
	t, ok := os.LookupEnv("MICRANTHA_TEMPLATE_PATH")

	if !ok {
		templatePath = path.Join("web", "template")
	} else {
		templatePath = t
	}
}

func templateFile(name ...string) string {
	return path.Join(templatePath, path.Join(name...))
}

// Template renders a template response given its name and parameters
func Template(w http.ResponseWriter, name string, parameters interface{}) error {

	t, ok := templates[name]

	w.Header().Set("X-Powered-By", "golang")

	if !ok {
		t = template.Must(template.ParseFiles(templateFile("layout.html"), templateFile(name)))
		t = template.Must(t.ParseGlob(templateFile("partials", "*.html")))
		templates[name] = t
	}

	err := t.Execute(w, parameters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	return err
}

// Format formats an object with the specified format.  The output will be written to the http writer
// and the status set to the code.
func Format(w http.ResponseWriter, format FormatType, code int, value interface{}) error {
	switch format {
	case FormatJSON:
		return JSON(w, code, value)
	case FormatText:
		return Text(w, code, value.(string))
	default:
		return errors.New("unknown format")
	}
}

// JSON ormats an object as json into an http writer with a status code.
func JSON(w http.ResponseWriter, code int, value interface{}) error {

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Header().Set("X-Powered-By", "golang")
	w.WriteHeader(code)
	return json.NewEncoder(w).Encode(value)
}

// Text formats an object as text into an http writer with a status code
func Text(w http.ResponseWriter, code int, value string) error {
	w.Header().Set("Content-Type", "text/plain; charset=UTF-8")
	w.Header().Set("X-Powered-By", "golang")
	w.WriteHeader(code)
	_, err := w.Write([]byte(value))
	return err
}

// Type determines an acceptable response type from a request.
func Type(r *http.Request) (FormatType, error) {
	contentType, _, err := mime.ParseMediaType(r.Header.Get("Accepts"))

	if err != nil {
		return FormatNone, err
	}

	if strings.Contains(contentType, "application/json") {
		return FormatJSON, nil
	}

	if strings.Contains(contentType, "text/plain") {
		return FormatText, nil
	}

	return FormatNone, nil
}

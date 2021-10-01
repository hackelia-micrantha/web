package render

import (
	"encoding/json"
	"errors"
	"html/template"
	"io"
	"mime"
	"net/http"
	"os"
	"path"
	"strconv"
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
	templates map[string]*template.Template
)

func init() {

	caching, ok := os.LookupEnv("MICRANTHA_TEMPLATE_CACHING")

	if ok {
		allowed, err := strconv.ParseBool(caching)

		if err == nil && allowed {
			templates = make(map[string]*template.Template)
		}
	}
}

// Template renders a template response given its name and parameters
func Template(w io.Writer, templatePath string, name string, parameters interface{}) error {

	t, ok := templates[name]

	if !ok {
		t = template.Must(template.ParseFiles(
			path.Join(templatePath, "_layouts", "default.html.tmpl"),
			path.Join(templatePath, name),
		))

		t = template.Must(t.ParseGlob(
			path.Join(templatePath, "_partials", "*.tmpl"),
		))

		if templates != nil {
			templates[name] = t
		}
	}

	return t.Execute(w, parameters)
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

// JSON formats an object as json into an http writer with a status code.
func JSON(w http.ResponseWriter, code int, value interface{}) error {

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(code)
	return json.NewEncoder(w).Encode(value)
}

// Streamable is an interface that can stream data to a response
type Streamable interface {
	Next() bool
	Scan(interface{}) error
}

// JSONStream formats a stream of objects into an http writer with a status code
func JSONStream(w http.ResponseWriter, code int, from Streamable, into func() interface{}) error {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(code)

	encoder := json.NewEncoder(w)

	_, err := w.Write([]byte{'['})

	if err != nil {
		return err
	}

	for from.Next() {
		value := into()

		if err := from.Scan(value); err != nil {
			return err
		}

		if err := encoder.Encode(value); err != nil {
			return err
		}
	}

	_, err = w.Write([]byte{']'})

	return err
}

// Text formats an object as text into an http writer with a status code
func Text(w http.ResponseWriter, code int, value string) error {
	w.Header().Set("Content-Type", "text/plain; charset=UTF-8")
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

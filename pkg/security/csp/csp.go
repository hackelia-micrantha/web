package csp

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"
)

// Helpful constants for CSP values
const (
	Self        = "'self'"
	None        = "'none'"
	Any         = "*"
	Header      = "Content-Security-Policy"
	DefaultSrc  = "default-src"
	ScriptSrc   = "script-src"
	ConnectSrc  = "connect-src"
	ImgSrc      = "img-src"
	FontSrc     = "font-src"
	StyleSrc    = "style-src"
	ManifestSrc = "manifest-src"
	ReportURI   = "report-uri"
)

type ContentPolicy struct {
	Default        string
	Script         string
	Connect        string
	Img            string
	Style          string
	Font           string
	Manifest       string
	ReportURI      string
	IgnorePatterns []string
	WebSocket      bool
}

func WithSelf(domains ...string) string {

	args := []string{
		"'self'",
	}

	for _, domain := range domains {
		args = append(args, domain)
	}

	return strings.Join(args, " ")
}

func (csp ContentPolicy) Middleware(next http.Handler) http.Handler {
	handler := csp.handlerFunc()
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		handler(rw, r)
		if next != nil {
			next.ServeHTTP(rw, r)
		}
	})
}

// handlerFunc is the http.HandlerFunc interface
func (csp *ContentPolicy) handlerFunc() http.HandlerFunc {
	policies := make(map[string]string)

	if csp.Default != "" {
		policies[DefaultSrc] = csp.Default
	}

	if csp.Script != "" {
		policies[ScriptSrc] = csp.Script
	}

	if csp.Img != "" {
		policies[ImgSrc] = csp.Img
	}

	if csp.Style != "" {
		policies[StyleSrc] = csp.Style
	}

	if csp.Font != "" {
		policies[FontSrc] = csp.Font
	}

	if csp.Connect != "" {
		policies[ConnectSrc] = csp.Connect
	}

	if csp.Manifest != "" {
		policies[ManifestSrc] = csp.Manifest
	}

	if csp.ReportURI != "" {
		policies[ReportURI] = csp.ReportURI
	}

	return func(rw http.ResponseWriter, r *http.Request) {
		for _, pattern := range csp.IgnorePatterns {
			// exclude specified paths from CSP protection
			if matched, _ := regexp.MatchString(pattern, r.URL.Path); matched {
				return
			}
		}
		if csp.WebSocket {
			proto := "ws"
			if r.TLS != nil {
				proto = "wss"
			}
			if connect, ok := policies[ConnectSrc]; ok {
				policies[ConnectSrc] = fmt.Sprintf("%s://%s", proto, r.Host)
			} else {
				policies[ConnectSrc] = fmt.Sprintf("%s %s://%s", connect, proto, r.Host)
			}
		}

		var header []string
		for key, val := range policies {
			header = append(header, fmt.Sprintf("%s %s", key, val))
		}

		if len(header) > 0 {
			rw.Header().Add(Header, strings.Join(header, "; "))
		}
	}
}

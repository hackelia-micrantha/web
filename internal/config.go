package internal

import "micrantha.com/web.git/pkg/security/csp"

type Config struct {
   ContentPolicy *csp.ContentPolicy
   PublicPath    string
   TemplatePath  string
}
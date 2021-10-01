package config

import (
	"micrantha.com/web.git/internal/fs"
	"micrantha.com/web.git/pkg/security/csp"
)

type Config struct {
	ContentPolicy *csp.ContentPolicy
	PublicPath    string
	TemplatePath  string
}

func NewConfig() *Config {
	return &Config{
		ContentPolicy: &csp.ContentPolicy{
			Script:   csp.WithSelf("analytics.micrantha.com"),
			Img:      csp.WithSelf("analytics.micrantha.com"),
			Manifest: csp.Self,
		},
		PublicPath:   fs.GetPublicPath(),
		TemplatePath: fs.GetTemplatePath(),
	}
}

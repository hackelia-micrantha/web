package config

import (
	"micrantha.com/web.git/internal"
	"micrantha.com/web.git/internal/fs"
	"micrantha.com/web.git/pkg/security/csp"
)

func NewConfig() *internal.Config {
	return &internal.Config{
		ContentPolicy: &csp.ContentPolicy{
			Script:   csp.WithSelf("analytics.micrantha.com"),
			Img:      csp.WithSelf("analytics.micrantha.com"),
			Manifest: csp.Self,
		},
		PublicPath:   fs.GetPublicPath(),
		TemplatePath: fs.GetTemplatePath(),
	}
}

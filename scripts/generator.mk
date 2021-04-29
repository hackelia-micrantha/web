
BUILDERS += build-generate-templates

.PHONY: build-generate-templates
build-generate-templates:
	@$(GO) run ./cmd/generator


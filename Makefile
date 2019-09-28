PKGS := $(shell find ./pkg/* ./internal/pkg/* -type d)

GO	?= go
GOLINT ?= golint
SASS ?= ./tools/sass
CMD ?= ./cmd/micrantha

.PHONY: all
all: build test

.PHONY: test
test: $(PKGS)

$(PKGS): % : %/*

%/*:
ifneq (, $(shell which $(GOLINT)))
	$(GOLINT) $@
endif
	$(GO) test $@

.PHONY: sass
sass:
	$(GO) run $(SASS) -src ./web/sass/app.scss -dest ./website/css

.PHONY: build
build: sass
	$(GO) build $(CMD)

.PHONY: resources
resources:
	@resources -declare -var=Template -tag=embed -package=assets -output=pkg/assets/template.go web/template
	@resources -declare -var=Website -tag=embed -package=assets -output=internal/pkg/assets/website.go website

.PHONY: run
run: sass
	$(GO) run $(CMD)

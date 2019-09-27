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

.PHONY: css
css:
    curl -o ./website/css/ https://necolas.github.io/normalize.css/8.0.1/normalize.css

.PHONY: run
run: sass
	$(GO) run $(CMD)
PKGS := $(shell find ./internal/pkg/* -type d)
CSS_SRC = web/sass
CSS_OUT = website/css
CSS_TARGETS = $(patsubst $(CSS_SRC)/%.scss, $(CSS_OUT)/%.css, $(filter-out $(CSS_SRC)/_*.scss, $(wildcard $(CSS_SRC)/*.scss)))
VENDOR = vendor

GO	?= go
GOLINT ?= golint
SASS ?= ./tools/sass
CMD ?= ./cmd/micrantha

.PHONY: all
all: build test

$(PKGS): % : %/*

%/*:
ifneq (, $(shell which $(GOLINT)))
	@echo "Linting $@..."
	@$(GOLINT) $@
endif
	@echo "Testing $@..."
	@$(GO) test $@

$(CSS_OUT):
	@-mkdir -p $(CSS_OUT)

$(CSS_TARGETS): $(CSS_OUT)/%.css : $(CSS_SRC)/%.scss | $(CSS_OUT)
	@echo "Compiling $? to $(CSS_OUT)/$@..."
	@$(GO) run $(SASS) -src $? -dest $(CSS_OUT)

$(VENDOR):
	@$(GO) mod vendor

.PHONY: test
test: $(PKGS)

.PHONY: clean
clean:
	@-rm -rf $(CSS_OUT)/*
	@-rm -f $(basename $(CMD))

.PHONY: build
build: $(CSS_TARGETS)
	@echo "Building $(CMD)..."
	@$(GO) build -v $(CMD)

.PHONY: dist
dist: $(VENDOR) $(CSS_TARGETS)
	@echo "Building vendored $(CMD)..."
	@$(GO) build -mod vendor -v $(CMD)

.PHONY: run
run:
	$(GO) run $(CMD)


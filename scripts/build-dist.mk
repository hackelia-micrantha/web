
VENDOR = vendor

$(VENDOR):
	@echo "Vendoring modules..."
	@$(GO) mod vendor

.PHONY: build-dist
build-dist: $(VENDOR)
	@echo "Building vendored $(EXE)..."
	@$(GO) build -mod vendor -v $(CMD)

.PHONY: dist
dist: $(CSS_TARGETS) build-dist


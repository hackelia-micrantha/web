
.PHONY: build-dev
build-dev:
	@echo "Building $(EXE)..."
	@$(GO) build -tags dev -v $(CMD)

.PHONY: dev
dev: $(CSS_TARGETS) build-dev


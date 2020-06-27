
GOLINT ?= golint

$(GOLINT):
	@$(GO) get golang.org/x/lint/golint

.PHONY: format
format:
	@$(GO) fmt ./internal/pkg/... ./pkg/... ./cmd/...

.PHONY: lint
lint: format $(GOLINT)
	@echo "Linting..."
	@$(GOLINT) ./internal/pkg/...
	@$(GOLINT) ./pkg/...
	@$(GOLINT) ./cmd/...

.PHONY: test
test: lint
	@echo "Testing..."
	@$(GO) test -v ./internal/pkg/... ./pkg/...


BUILDERS += build-health-check

.PHONY: build-health-check
build-health-check:
	@$(GO) build -o $(BIN_DIR)/health-check ./cmd/health-check


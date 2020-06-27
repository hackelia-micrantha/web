
.PHONY: clean
clean:
	@echo "Clean intermediate files..."
	@$(GO) clean -r -cache -testcache ./internal/pkg/... ./pkg/... ./cmd/...
	@-rm -rf $(APP_CSS)/* $(EXE)


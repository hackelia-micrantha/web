
.PHONY: clean
clean:
	@echo "Clean intermediate files..."
	@$(GO) clean -r -cache -testcache ./internal/pkg/... ./pkg/... ./cmd/...
	@-rm -f pkg/assets/resource.go
	@-rm -rf $(APP_CSS)/* $(FW_CSS)/* $(EXE) $(LIB)


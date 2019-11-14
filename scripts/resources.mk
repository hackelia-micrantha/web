
EMBED = parcello
RES_LIB = plugin/main
RES_DIR = plugin/resources
RES_DEPS = $(shell find ./plugin -type f)

$(EMBED):
	@$(GO) get -u github.com/phogolabs/parcello
	@$(GO) install github.com/phogolabs/parcello/cmd/parcello

$(LIB): $(EMBED)
	@echo "Generating embedded resources..."
	@$(EMBED) -r -d ./$(RES_DIR) -b ./$(RES_LIB) >/dev/null
	@$(GO) build -v -buildmode=plugin -o $(LIB) ./$(RES_LIB)

.PHONY: resources
resources: $(RES_DEPS) $(LIB)

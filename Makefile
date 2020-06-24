
GO	?= go
MICRA_PATH ?= /Users/ryjen/.local/opt/micra
PROJECT_NAME ?= "micrantha"
CMD ?= ./cmd/$(PROJECT_NAME)
EXE ?= $(shell basename $(CMD))
LIB ?= "$(EXE).so"

CLEANERS += clean-project

.PHONY: all
all: help

.PHONY: clean-project
clean-project:
	@echo "Cleaning project"
	@rm -rf $(EXE)

# Delegate to scripts folder

include $(MICRA_PATH)/scripts/index.mk

# running

.PHONY: run
run:
	$(GO) run $(CMD) -- $(ARGS)


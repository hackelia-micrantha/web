
GO	?= go
LOCAL_LIB := $(shell test -d .micra; echo $$?)
ifeq ($(LOCAL_LIB),0)
MICRA_PATH ?= .micra
else
MICRA_PATH ?= ~/.local/share/micra
endif
PROJECT_NAME ?= "micrantha"
BIN_DIR ?= ./bin
CMD ?= ./cmd/$(PROJECT_NAME)
EXE ?= $(shell basename $(CMD))

CLEANERS += clean-project

.PHONY: all
all: help

.PHONY: clean-project
clean-project:
	@echo "Cleaning project"
	@rm -rf $(BIN_DIR)/*

# Delegate to scripts folder

include $(MICRA_PATH)/library/scripts/index.mk

# running

.PHONY: run
run:
	$(GO) run $(CMD) -- $(ARGS)



GO	?= go
CMD ?= ./cmd/micrantha
EXE ?= $(shell basename $(CMD))
LIB ?= "$(EXE).so"

.PHONY: all
all: test

# CSS building

include scripts/sass.mk

# testing and linting

include scripts/verify.mk

# project cleaning

include scripts/clean.mk

# building

include scripts/build-dev.mk

include scripts/build-dist.mk

# running

.PHONY: run
run:
	$(GO) run $(CMD)


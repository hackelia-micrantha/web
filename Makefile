
REGISTRY ?=
SLUG ?= micrantha/web
TAG ?= latest
PORT ?= 3000
IMAGE := $(if $(REGISTRY),$(REGISTRY)/,)$(SLUG):$(TAG)

.DEFAULT_GOAL := help

.PHONY: help all setup install dev build start css lint lint-fix typecheck check package image run deploy deploy-cloudflare

help: ## [Core] Show available targets and descriptions.
	@awk ' \
	BEGIN { \
		FS = ":.*## "; \
		r = "\033[0m"; \
		group_color["Core"] = "\033[35m"; \
		group_color["Dev"] = "\033[36m"; \
		group_color["Docker"] = "\033[33m"; \
		group_color["Deploy"] = "\033[32m"; \
		order[1] = "Core"; \
		order[2] = "Dev"; \
		order[3] = "Docker"; \
		order[4] = "Deploy"; \
	} \
	/^[a-zA-Z0-9_.-]+:.*## / { \
		line = $$2; \
		group = "Other"; \
		desc = line; \
		if (line ~ /^\[[^]]+\][[:space:]]*/) { \
			group = line; \
			sub(/^\[/, "", group); \
			sub(/\].*/, "", group); \
			sub(/^\[[^]]+\][[:space:]]*/, "", desc); \
		} \
		c = group_color[group]; \
		if (c == "") c = "\033[37m"; \
		entries[group] = entries[group] sprintf("  %s%-20s%s %s\n", c, $$1, r, desc); \
		seen[group] = 1; \
	} \
	END { \
		for (i = 1; i <= 4; i++) { \
			g = order[i]; \
			if (seen[g]) { \
				printf("%s%s%s:\n", group_color[g], g, r); \
				printf("%s", entries[g]); \
				printf("\n"); \
			} \
		} \
		if (seen["Other"]) { \
			printf("Other:\n"); \
			printf("%s", entries["Other"]); \
		} \
	}' $(MAKEFILE_LIST)

all: ## [Core] Alias for help.
	@$(MAKE) help

setup: ## [Core] Install dependencies if missing.
	@if [ ! -d "./node_modules" ]; then \
		yarn install; \
	fi

install: setup ## [Core] Alias for setup.

dev: setup ## [Dev] Run local development server.
	yarn dev

build: setup ## [Dev] Build the app for production.
	yarn build

start: setup ## [Dev] Serve the built app.
	yarn start

css: setup ## [Dev] Generate Tailwind CSS once.
	yarn generate:css

lint: setup ## [Dev] Run ESLint checks.
	yarn lint

lint-fix: setup ## [Dev] Run ESLint with autofix.
	yarn lint:fix

typecheck: setup ## [Dev] Run TypeScript type checks.
	yarn typecheck

check: setup ## [Dev] Run lint, typecheck, and build.
	yarn lint
	yarn typecheck
	yarn build

image: setup ## [Docker] Build the Docker image.
	docker build -t $(IMAGE) .

run: image ## [Docker] Build and run the Docker image locally.
	docker run -p $(PORT):3000 $(IMAGE)

deploy: image ## [Deploy] Push image tags to container registry.
	docker tag $(IMAGE) $(if $(REGISTRY),$(REGISTRY)/,)$(SLUG):latest
	docker push $(if $(REGISTRY),$(REGISTRY)/,)$(SLUG) --all-tags

deploy-cloudflare: setup ## [Deploy] Deploy app to Cloudflare.
	yarn deploy:cloudflare

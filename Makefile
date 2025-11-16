
REGISTRY ?=
SLUG ?= micrantha/web
TAG ?= latest
PORT ?= 3000
IMAGE := $(if $(REGISTRY),$(REGISTRY)/,)$(SLUG):$(TAG)

all:
	@echo "image"
	@echo "deploy"
	@echo "run"

setup:
	@if [ ! -d "./node_modules" ]; then \
		yarn install; \
	fi

image: setup
	docker build -t $(IMAGE) .

run: image
	docker run -p $(PORT):3000 $(IMAGE)

deploy: image
	docker tag $(IMAGE) $(if $(REGISTRY),$(REGISTRY)/,)$(SLUG):latest
	docker push $(if $(REGISTRY),$(REGISTRY)/,)$(SLUG) --all-tags

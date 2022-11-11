
all:
	@echo "image"
	@echo "deploy"
	@echo "run"

setup:
	@if [ ! -d "./node_modules" ]; then \
		yarn install; \
	fi

image: setup
	docker build -t $(REGISTRY)/$(SLUG):$(TAG) .

run: image
	docker run -p $(PORT):3000 $(REGISTRY)/$(SLUG):$(TAG)

deploy: image
	docker tag $(REGISTRY)/$(SLUG):$(TAG) $(REGISTRY)/$(SLUG):latest
	docker push $(REGISTRY)/$(SLUG) --all-tags

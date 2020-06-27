
SASS ?= ./tools/sass
APP_SASS = web/sass
APP_CSS = website/css
CSS_TARGETS = $(filter-out $(APP_SASS)/_*.scss, $(wildcard $(APP_SASS)/*.scss))
APP_TARGETS = $(patsubst $(APP_SASS)/%.scss, $(APP_CSS)/%.css, $(CSS_TARGETS))

.PHONY: css
css: $(APP_CSS) $(APP_TARGETS)

$(APP_CSS):
	@-mkdir -p $(APP_CSS)

$(APP_CSS)/%.css: $(APP_SASS)/%.scss
	@echo "Compiling $? to $@..."
	@$(GO) run $(SASS) -src $? -dest $(APP_CSS)


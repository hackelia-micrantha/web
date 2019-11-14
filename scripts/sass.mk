
SASS ?= ./tools/sass
APP_SASS = web/sass
APP_CSS = website/css
APP_TARGETS = $(patsubst $(APP_SASS)/%.scss, $(APP_CSS)/%.css, $(filter-out $(APP_SASS)/_*.scss, $(wildcard $(APP_SASS)/*.scss)))
CSS_TARGETS = $(APP_TARGETS)

$(APP_CSS):
	@-mkdir -p $(APP_CSS)

$(APP_TARGETS): $(APP_CSS)/%.css : $(APP_SASS)/%.scss | $(APP_CSS)
	@echo "Compiling $? to $(APP_CSS)/$@..."
	@$(GO) run $(SASS) -src $? -dest $(APP_CSS)


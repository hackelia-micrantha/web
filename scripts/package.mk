
HELPS += help-image

.PHONY: image
image:
	@build/package/create-image

.PHONY: deploy
deploy: image
	@/usr/bin/ssh micrantha.com 'redeploy registry.gitlab.com/micrantha/web'

.PHONY: help-image
help-image:
	@echo " image               build a docker image"
	@echo " deploy              build and deploy the docker image"

HELPS += help-image

.PHONY: image
image:
	@build/package/create_image

.PHONY: help-image
help-image:
	@echo " image               build a docker image"
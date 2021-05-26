MKCERT_ENABLED ?= $(shell command -v mkcert; echo $$?)

HELPS += help-certs

CERT_HOSTS ?= localhost 127.0.0.1 ::1 $(PROJECT_NAME).local

.PHONY: certs help-certs

certs: 
	@-mkdir test
	@echo "generating testing certificates..."
	@mkcert -install
	@mkcert -cert-file test/certs/dev.pem -key-file test/certs/dev-key.pem $(CERT_HOSTS)

help-certs:
	@echo " certs               generate testing certificates"



install:
	npm ci
lint:
	npx eslint .
fix-lint:
	npx eslint . --fix
.PHONY: install dev test lint smoke eval build

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev:
	@echo "Starting dev servers..."
	# In separate terminals:
	# cd backend && uvicorn app.main:app --reload
	# cd frontend && npm run dev

test:
	cd backend && pytest -q

lint:
	cd backend && ruff check app tests

smoke:
	python scripts/smoke_test.py

eval:
	python scripts/evaluate.py

build:
	cd frontend && npm run build

### KI Demo

Run the demo in this folder using `uv`, a fast Python package and project manager. It reads dependencies from `pyproject.toml` and installs them automatically when you run the script.

### Requirements

- **uv**: install via one of the following:
  - macOS/Linux (script):
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```
  - macOS (Homebrew):
    ```bash
    brew install uv
    ```
- **.env** file with your API key (see below)

### Dependencies

The script uses these libraries (managed by `uv` via `pyproject.toml`):

- **openai**: client SDK for the Responses API
- **pydantic**: data validation and parsing
- **tabulate**: pretty-print tables

### Environment variables (.env)

Create a `.env` file in this directory with at least:

```env
OPENAI_API_KEY=your_api_key_here
```

### Run

From this directory:

```bash
uv run --env-file .env main.py
```

Notes:

- The script loads `test.jpg` from this folder. Replace or update the path in `main.py` if needed.

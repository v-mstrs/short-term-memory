# murim-slop


A very simple backend API that manages a local SQLite database of novels and their corresponding characters.

## Instalation


```bash
git clone https://github.com/v-mstrs/murim-slop.git
cd murim-slop
```

```bash
# Create the environment
python -m venv .venv

# Activate the environment (Command depends on your OS)
# Windows (Command Prompt):
# .venv\Scripts\activate
# Windows (PowerShell):
# .venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate
```
```bash
pip install -r requirements.txt
```

```bash
uvicorn app.main:app --reload
```


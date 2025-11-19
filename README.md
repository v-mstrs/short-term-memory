# short-term-memory

A very simple backend API that manages a local SQLite database of novels and their corresponding characters.

## Instalation


```bash
git clone https://github.com/v-mstrs/short-term-memory.git
cd short-term-memory
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
Then run populate_db.py to initialize the database and seed initial novel/character data
```bash
python populate_db.py
```

```bash
uvicorn app.main:app --reload
```

Checking http://127.0.0.1:8000/novel/the-great-heavenly-demon-sovereign you can see the list of characters. <br>
Now by adding some [js](example/script.js) you can do something likes this:

https://github.com/user-attachments/assets/f4ef893e-14ce-480a-82d2-102a660a4d5f


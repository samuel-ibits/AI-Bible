# AI Bible

AI Bible is a Next.js application with a local Flask/Python backend for Bible lookup, semantic search, and text-to-speech.

## Tech Stack

- Next.js 15 / React 19
- TypeScript
- Tailwind CSS
- Flask
- Sentence Transformers
- PyTorch

## Prerequisites

Install these before running the project:

- Node.js 18.18 or newer
- npm
- Python 3.10 or 3.11
- Git

On Windows, make sure `python` works from PowerShell:

```powershell
python --version
```

## Clone the Repository

```bash
git clone https://github.com/samuel-ibits/AI-Bible.git
cd AI-Bible
```

## Install Dependencies

Install the JavaScript dependencies:

```bash
npm install
```

Create the Python virtual environment and install Python dependencies:

```bash
npm run venv:install
```

This creates a local `venv` folder and installs packages from `src/python/requirements.txt`.

## Add the Bible Data Files

The backend needs Bible JSON files in `src/data`. This folder is ignored by Git, so a fresh clone may not include it.

Download the Bible data from Google Drive:

```text
https://drive.google.com/file/d/1_HfmmqpjOJ2A0TPhWF_A1EKLmfAZUOTh/view?usp=sharing
```

Extract or copy the JSON files into `src/data` so the files look like this:

```text
src/data/asv.json
src/data/asvs.json
src/data/bishops.json
src/data/coverdale.json
src/data/geneva.json
src/data/kjv.json
src/data/kjv_strongs.json
src/data/net.json
src/data/tyndale.json
src/data/web.json
```

At minimum, `src/data/kjv.json` is needed for the default startup flow.

## Run the Application

Start the Next.js frontend and Flask backend together:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The Flask backend runs on:

```text
http://localhost:5000
```

The Next.js API routes call the Flask backend at `localhost:5000`, so both processes need to be running.

## Useful Commands

```bash
npm run dev
```

Runs the frontend and backend together.

```bash
npm run next
```

Runs only the Next.js frontend.

```bash
npm run python
```

Runs only the Flask backend using the local Python virtual environment.

```bash
npm run build
```

Builds the Next.js app.

## Project Structure

```text
src/app/          Next.js app routes and API routes
src/components/   React components
src/data/         Bible JSON data files
src/python/       Flask backend, services, model cache, and Python requirements
src/scripts/      Node scripts for Python setup/startup
public/           Static frontend assets
```

## Bible Data and Models

Bible version data is loaded from `src/data`.

Supported versions include:

```text
asv, asvs, bishops, coverdale, geneva, kjv_strongs, kjv, net, tyndale, web
```

The Python backend uses `sentence-transformers/all-MiniLM-L6-v2` for semantic search. The model/cache files are included in the repo where available. If a required model file is missing, Sentence Transformers may download it automatically on first run.

## Troubleshooting

If `npm run dev` fails because Python cannot be found, install Python and make sure it is available as `python` in your terminal.

If Python dependencies fail to install, delete the `venv` folder and run:

```bash
npm run venv:install
```

If port `3000` or `5000` is already in use, stop the other process using that port, then run:

```bash
npm run dev
```

If search is slow the first time, wait for the backend to load the model and embeddings. Later searches should be faster after the cache is loaded.

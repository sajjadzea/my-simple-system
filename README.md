# Interactive Water Transfer Dashboard

This project visualizes the cause–effect chain and potential impacts of the Kalat to Mashhad water transfer plan. The interface is a static HTML/JS application that loads graph data from `data.json` and renders it with D3.js.

## Serving the application

Because `main.js` loads `data.json` with `fetch()`, the files need to be served over HTTP. Opening `index.html` directly from disk will not work in most browsers. Run a simple local server and then open the page in a browser.

### Requirements
* A modern web browser.
* Either **Python 3** or **Node.js** (for `http-server`).

### Using Python 3
From the project directory run:

```bash
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000/index.html`.

### Using Node.js
If you prefer Node.js, install the `http-server` package globally or use `npx`:

```bash
# one-time installation
npm install -g http-server

# start the server
http-server -p 8000
```

Open `http://localhost:8000/index.html` after starting the server.

## Project contents
- `index.html` – main HTML page
- `main.js` – JavaScript for rendering the interactive graph
- `data.json` – graph data

Running a local server will let `fetch('data.json')` succeed and the interactive diagram will load correctly.

## Running tests

Execute the following command in the project root:

```bash
npm test
```

This runs the small test suite verifying some utility functions in `main.js`.

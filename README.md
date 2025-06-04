# My Simple System

This project visualizes a network of nodes and links.

## Running the App

The application fetches `data.json`, so it should be served from a local web server instead of opening the file directly. If you have `http-server` installed, run:

```bash
npx http-server
```

Then open the shown URL (usually http://localhost:8080) in your browser. You can also use any other static server such as `python3 -m http.server`.

## Running tests

1. Install dependencies:
   ```bash
   npm install
   ```
2. Execute the test suite:
   ```bash
   npm test
   ```

You can also run the assertion script directly:

```bash
node tests/utils.test.js
```

This runs the small test suite verifying some utility functions in `main.js`.

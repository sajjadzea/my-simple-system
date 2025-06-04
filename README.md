# My Simple System

This project visualizes a network graph using D3.js.
This project visualizes a network of nodes and links.

## Running the App

The application fetches `data.json`, so it should be served from a local web server instead of opening the file directly. If you have `http-server` installed, run:

```bash
npx http-server
```

Then open the shown URL (usually [http://localhost:8080](http://localhost:8080)) in your browser. You can also use any other static server such as `python3 -m http.server`.

## Running Tests

Unit tests use [Jest](https://jestjs.io/) to verify the behaviour of `findLayer`.
To install dependencies and run the test suite:

```bash
npm install
npm test
```

Execute the following command in the project root:

```bash
node tests/utils.test.js
```

This runs the small test suite verifying some utility functions in `main.js`.

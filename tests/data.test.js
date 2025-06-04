// Jest tests for data.json
// To run these tests:
//   1. Install dependencies: npm install
//   2. Run tests: npm test

const fs = require('fs');
const path = require('path');

let data;

beforeAll(() => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'data.json'), 'utf8');
  data = JSON.parse(content);
});

test('data.json parses successfully', () => {
  expect(data).toBeDefined();
  expect(Array.isArray(data.nodes)).toBe(true);
  expect(Array.isArray(data.links)).toBe(true);
});

test('node ids are unique', () => {
  const ids = data.nodes.map(n => n.id);
  const unique = new Set(ids);
  expect(unique.size).toBe(ids.length);
});

test('links refer to existing nodes', () => {
  const ids = new Set(data.nodes.map(n => n.id));
  data.links.forEach(l => {
    expect(ids.has(l.source)).toBe(true);
    expect(ids.has(l.target)).toBe(true);
  });
});

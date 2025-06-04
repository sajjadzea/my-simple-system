const assert = require('assert');
const { filterLinks, findLayer } = require('../main');

// Test findLayer detection
assert.strictEqual(findLayer({label: 'تصمیم سیاسی'}), 'political');
assert.strictEqual(findLayer({label: 'هزینه پروژه'}), 'economic');
assert.strictEqual(findLayer({label: 'اکوسیستم تالاب'}), 'environment');
assert.strictEqual(findLayer({label: 'اعتراض اجتماعی'}), 'social');

// Prepare sample nodes and links
global.nodes = [
  { id: 'a', layer: 'environment' },
  { id: 'b', layer: 'environment' },
  { id: 'c', layer: 'social' }
];

const links = [
  { source: 'a', target: 'b', type: '+' },
  { source: 'a', target: 'c', type: '-' },
  { source: 'c', target: 'a', type: '+' }
];

const filtered = filterLinks(links, 'environment', global.nodes);
assert.deepStrictEqual(filtered, [ { source: 'a', target: 'b', type: '+' } ]);

console.log('All tests passed!');

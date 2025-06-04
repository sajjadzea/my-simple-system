const { filterLinks, findLayer } = require('../main');

test('findLayer detects layers', () => {
  expect(findLayer({ label: 'تصمیم سیاسی' })).toBe('political');
  expect(findLayer({ label: 'هزینه پروژه' })).toBe('economic');
  expect(findLayer({ label: 'اکوسیستم تالاب' })).toBe('environment');
  expect(findLayer({ label: 'اعتراض اجتماعی' })).toBe('social');
});

test('filterLinks filters links by layer', () => {
  const nodes = [
    { id: 'a', layer: 'environment' },
    { id: 'b', layer: 'environment' },
    { id: 'c', layer: 'social' }
  ];

  const links = [
    { source: 'a', target: 'b', type: '+' },
    { source: 'a', target: 'c', type: '-' },
    { source: 'c', target: 'a', type: '+' }
  ];

  const filtered = filterLinks(nodes, links, 'environment');
  expect(filtered).toEqual([{ source: 'a', target: 'b', type: '+' }]);
});

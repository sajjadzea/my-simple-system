const { findLayer } = require('../main');

describe('findLayer', () => {
  test('returns predefined layer if node already has layer property', () => {
    expect(findLayer({ label: 'something', layer: 'social' })).toBe('social');
  });

  test('matches political keywords', () => {
    expect(findLayer({ label: 'تصمیم سیاسی مهم' })).toBe('political');
  });

  test('matches economic keywords', () => {
    expect(findLayer({ label: 'برآورد هزینه پروژه' })).toBe('economic');
  });

  test('matches environment keywords', () => {
    expect(findLayer({ label: 'تأثیر بر جریان آب تالاب' })).toBe('environment');
  });

  test('matches social keywords', () => {
    expect(findLayer({ label: 'اعتراضات اجتماعی محلی' })).toBe('social');
  });

  test('defaults to environment when no keywords match', () => {
    expect(findLayer({ label: 'موضوع نامشخص' })).toBe('environment');
  });
});

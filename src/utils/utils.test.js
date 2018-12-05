const { getStatusClass } = require('./utils');

test('number 7 means alive', () => {
  expect(getStatusClass(7)).toBe('alive');
});

// Run with: node --test test/proportional-fit.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const cases = [
  ['tall source on portrait paper', 100, 200, 100, 1000, 20, 200],
  ['wide source on landscape paper', 200, 100, 1000, 100, 200, 20],
  ['wide source on square paper', 100, 100, 400, 100, 100, 25],
  ['tall source on square paper', 100, 100, 100, 400, 25, 100],
  ['square source on portrait paper', 100, 200, 50, 50, 100, 100],
  ['matching proportions', 100, 200, 50, 100, 100, 200]
];
function namedFunction(text, start, end) {
  const begin = text.indexOf(start);
  assert.ok(begin >= 0, start);
  const finish = text.indexOf(end, begin);
  assert.ok(finish >= 0, end);
  return text.slice(begin, finish + end.length);
}
for (const file of ['src/math.js', 'dist/graphics.js']) {
  const context = {acgraph: {math: {}}, goog: {
    provide() {}, require() {}, exportSymbol() {},
    math: {Coordinate: function() {}, Rect: function() {}, Size: function() {}}
  }};
  vm.createContext(context);
  // Evaluate the whole math source; the uncompiled distribution contains the same module.
  const text = read(file);
  vm.runInContext(file === 'src/math.js' ? text :
    namedFunction(text, 'acgraph.math.fitWithProportion = function', '\n};'), context);
  for (const [name, tw, th, sw, sh, ew, eh] of cases) {
    test(file + ': ' + name, () => {
      const actual = Array.from(context.acgraph.math.fitWithProportion(tw, th, sw, sh));
      assert.deepEqual(actual, [ew, eh]);
      assert.ok(actual[0] <= tw && actual[1] <= th);
      assert.equal(actual[0] / actual[1], sw / sh);
    });
  }
}
// Exercise the actual compiled PDF-data helper with a synthetic stage. No export request is sent.
const compiled = namedFunction(read('dist/graphics.min.js'), 'function dk(', 'b.responseType="file"}');
const context = {r: x => x !== undefined, v: x => typeof x === 'number',
  u: x => typeof x === 'string', fi: {fixture: {width: 100, height: 200}}};
vm.createContext(context);
vm.runInContext(compiled, context);
test('compiled PDF export fits tall stage on portrait paper', () => {
  const stage = {width: () => 100, height: () => 1000,
    ec: (w, h) => [w, h]};
  const data = {};
  context.dk(stage, data, 'fixture', false);
  assert.deepEqual(Array.from(data.data), [20, 200]);
  assert.equal(data.dataType, 'svg');
});

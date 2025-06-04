const { dragstarted, dragged, dragended, __setSimulation } = require('../main');

class FakeSimulation {
  constructor() {
    this._alphaTarget = 0;
    this._nodes = [{ id: 'n1' }];
  }
  nodes() { return this._nodes; }
  alphaTarget(val) {
    if (val === undefined) return this._alphaTarget;
    this._alphaTarget = val; return this;
  }
  restart() { this.restarted = true; return this; }
}

function createSim() {
  return new FakeSimulation();
}

test('drag handlers keep simulation responsive', () => {
  const sim = createSim();
  __setSimulation(sim);
  const node = sim.nodes()[0];

  // start drag
  dragstarted({ active: 0 }, node);
  expect(sim.alphaTarget()).toBeGreaterThan(0);
  // simulate some movement
  dragged({ x: 100, y: 50 }, node);
  expect(node.fx).toBe(100);
  expect(node.fy).toBe(50);
  // end drag
  dragended({ active: 0 }, node);
  expect(sim.alphaTarget()).toBe(0);
  expect(node.fx).toBeNull();
  expect(node.fy).toBeNull();
});

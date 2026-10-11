import test from "node:test";
import assert from "node:assert/strict";
import { allowedHandling, handleCase, initialHandling, productRules } from "../src/lib/training/balancer-workflow.ts";

const base = { notFull: false, destination: "Cartoner", result: "OK", initiallyWrapped: false };
const run = (item, actions) => actions.reduce((state, action) => handleCase(state, action, item), initialHandling);

test("Balancer must receive a result before handling; there is no weigh or scan action", () => {
  assert.deepEqual(allowedHandling(initialHandling, base), ["receive"]);
  assert.equal(handleCase(initialHandling, "wrap", base).wrapped, false);
  assert.equal(handleCase(initialHandling, "trolley", base).location, "workstation");
});

test("normal carton is wrapped, checked and placed on Balancer trolley before pallet", () => {
  assert.equal(run(base, ["receive", "trolley"]).location, "workstation");
  assert.equal(run(base, ["receive", "wrap", "trolley"]).location, "workstation");
  const trolley = run(base, ["receive", "wrap", "ik", "trolley"]);
  assert.equal(trolley.location, "trolley");
  assert.equal(handleCase(trolley, "pallet", base).location, "pallet");
});

test("not full Cartoner requires its identity before trolley", () => {
  const item = { ...base, notFull: true };
  let state = run(item, ["receive", "wrap", "ik"]);
  assert.equal(handleCase(state, "trolley", item).location, "workstation");
  state = handleCase(state, "identity", item);
  assert.equal(state.identified, true);
  assert.equal(handleCase(state, "trolley", item).location, "trolley");
});

test("not full Annex goes to backup for QA, not directly to trolley or pallet", () => {
  const item = { ...base, notFull: true, destination: "Annex" };
  const received = run(item, ["receive"]);
  assert.equal(handleCase(received, "wrap", item).wrapped, false);
  assert.equal(handleCase(received, "trolley", item).location, "workstation");
  const qa = handleCase(received, "qa", item);
  assert.equal(qa.location, "qa");
  assert.equal(handleCase(qa, "pallet", item).location, "qa");
});

test("wrapped NG must be unwrapped before NG area and can never enter ready-stock flow", () => {
  const item = { ...base, result: "NG", initiallyWrapped: true };
  const received = run(item, ["receive"]);
  assert.equal(handleCase(received, "ng", item).location, "workstation");
  const ng = run(item, ["receive", "unwrap", "ng"]);
  assert.equal(ng.location, "ng");
  assert.equal(handleCase(ng, "trolley", item).location, "ng");
  assert.equal(handleCase(ng, "pallet", item).location, "ng");
});

test("unwrapped NG goes to NG area, including not full Annex NG", () => {
  const item = { ...base, result: "NG", notFull: true, destination: "Annex" };
  assert.equal(run(item, ["receive", "qa"]).location, "workstation");
  assert.equal(run(item, ["receive", "ng"]).location, "ng");
});

test("finished carton has no obsolete container-return action", () => {
  const state = run(base, ["receive", "wrap", "ik", "trolley", "pallet"]);
  assert.equal(state.location, "pallet");
  assert.deepEqual(allowedHandling(state, base), []);
});

test("confirmed carton mappings remain distinct from tentative HAV 3D", () => {
  for (const [model, carton] of [["Craig", "IK 2"], ["HAV 3V", "IK 3"], ["HAV 3LL", "L"], ["Nasuno", "IK 4"]]) {
    assert.equal(productRules.find((rule) => rule.model === model).carton, carton);
    assert.equal(productRules.find((rule) => rule.model === model).tentative, false);
  }
  assert.equal(productRules.find((rule) => rule.model === "HAV 3D").tentative, true);
});

test("rework requires scan, weight result and IK Pass 3 before wrapping", () => {
  const item = { ...base, lotType: "rework" };
  assert.deepEqual(allowedHandling(initialHandling, item), ["scan"]);
  assert.equal(run(item, ["receive"]).received, false);
  const scanned = run(item, ["scan"]);
  assert.deepEqual(allowedHandling(scanned, item), ["receive"]);
  const weighed = run(item, ["scan", "receive"]);
  assert.equal(handleCase(weighed, "wrap", item).wrapped, false);
  assert.deepEqual(allowedHandling(weighed, item), ["ik"]);
  const identified = run(item, ["scan", "receive", "ik"]);
  assert.deepEqual(allowedHandling(identified, item), ["wrap"]);
  assert.equal(run(item, ["scan", "receive", "ik", "wrap", "trolley"]).location, "trolley");
});
test("rework NG stays in NG handling and cannot receive pass for wrapping", () => {
  const item = { ...base, lotType: "rework", result: "NG" };
  const weighed = run(item, ["scan", "receive"]);
  assert.deepEqual(allowedHandling(weighed, item), ["ng"]);
  assert.equal(handleCase(weighed, "ik", item).ikPass, false);
});
test("Craig quantity variants and HAV 3P are distinct from HAV 3V", () => {
  assert.deepEqual(productRules.find((rule) => rule.model === "Craig").referenceQuantities, [100, 200]);
  const hav3p = productRules.find((rule) => rule.model === "HAV 3P");
  assert.equal(hav3p.referenceQuantity, 272);
  assert.equal(hav3p.carton, "Belum dirinci");
  assert.equal(productRules.find((rule) => rule.model === "HAV 3V").carton, "IK 3");
});

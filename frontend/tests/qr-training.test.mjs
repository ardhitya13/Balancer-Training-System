import assert from "node:assert/strict";
import test from "node:test";
import { initialScanState, scanReducer, initialStandard, recordStandard, standardComplete, trainingKey } from "../src/app/qr-training.ts";

const box = { barcode: "QR-001", lotNumber: "LOT-DEMO", boxNumber: "BX-001", quantity: 24, actualWeight: 12480, standardWeightMin: 12300, standardWeightMax: 12600, leader: "Leader Demo A" };
const scan = () => scanReducer(initialScanState, { type: "scan", code: " QR-001 ", boxes: [box] });
const weigh = (value) => scanReducer(scanReducer(scan(), { type: "weight", value }), { type: "check" });

test("input and thresholds use grams without implicit scaling", () => {
  assert.equal(weigh("12480,5").result.weight, 12480.5);
  assert.equal(weigh("12480,5").result.status, "PASS");
  assert.equal(weigh("12.48").result.weight, 12.48);
  assert.equal(weigh("12.48").result.status, "NOT PASS");
  assert.match(weigh("11910").result.message, /390.00 gram/);
});

test("standard identity separates lot, model, quantity and full/not full", () => {
  const original = trainingKey(box);
  for (const variant of [{ ...box, fillStatus: "not_full" }, { ...box, lotNumber: "LOT-OTHER" }, { ...box, model: "Nasuno M" }, { ...box, quantity: 10 }]) assert.notEqual(trainingKey(variant), original);
  assert.equal(trainingKey({ ...box, fillStatus: "full" }), original);
});

test("standard requires operator, matching QR and matching box before any weight", () => {
  assert.equal(recordStandard(initialStandard, { step: "full", value: "12" }, box).full, null);
  let state = recordStandard(initialStandard, { step: "operator", value: "OP-100" }, box);
  assert.equal(recordStandard(state, { step: "qr", value: "WRONG" }, box).qr, false);
  state = recordStandard(state, { step: "qr", value: box.barcode }, box);
  assert.equal(recordStandard(state, { step: "box", value: "WRONG" }, box).boxScanned, false);
  state = recordStandard(state, { step: "box", value: box.boxNumber }, box);
  assert.equal(recordStandard(state, { step: "sample", value: "1" }, box).samples.length, 0);
  assert.equal(recordStandard(state, { step: "full", value: "0" }, box).full, null);
});

test("full box plus exactly ten valid steps completes standard without deriving thresholds", () => {
  let state = initialStandard;
  for (const [step, value] of [["operator", "OP-100"], ["qr", box.barcode], ["box", box.boxNumber], ["full", "12480"]]) state = recordStandard(state, { step, value }, box);
  assert.equal(state.full, 12480);
  assert.equal(recordStandard(state, { step: "sample", value: "NaN" }, box).samples.length, 0);
  for (let i = 0; i < 10; i++) {
    assert.equal(standardComplete(state), false);
    state = recordStandard(state, { step: "sample", value: String(i + 1) }, box);
  }
  assert.equal(standardComplete(state), true);
  assert.equal(recordStandard(state, { step: "sample", value: "11" }, box).samples.length, 10);
});

test("completed recording unlocks weighing but never fabricates PASS without thresholds", () => {
  const variant = { ...box, standardWeightMin: null, standardWeightMax: null, standardRecorded: true };
  let state = scanReducer(initialScanState, { type: "scan", code: box.barcode, boxes: [variant] });
  state = scanReducer(state, { type: "weight", value: "12480" });
  state = scanReducer(state, { type: "check" });
  assert.equal(state.result.status, "TERCATAT");
  assert.equal(state.result.weight, 12480);
  assert.equal(scanReducer(state, { type: "reported" }).reported, false);
});

test("QR valid reveals the associated record; weighing is blocked beforehand", () => {
  assert.equal(scan().box, box);
  assert.equal(scan().weight, "");
  assert.equal(scanReducer(initialScanState, { type: "weight", value: "12480" }).weight, "");
  const blocked = scanReducer(initialScanState, { type: "check" });
  assert.equal(blocked.result, null);
  assert.match(blocked.error, /Scan QR/);
});

test("unknown QR clears a previous identity, weight, result and report state", () => {
  const previous = scanReducer(weigh("11910"), { type: "reported" });
  const next = scanReducer(previous, { type: "scan", code: "QR-OTHER", boxes: [box] });
  assert.equal(next.box, null);
  assert.equal(next.weight, "");
  assert.equal(next.result, null);
  assert.equal(next.reported, false);
  assert.match(next.error, /tidak terdaftar/);
});

test("inclusive limits, normal weight and decimal comma pass", () => {
  for (const input of ["12300", "12600", "12480", "12480"]) assert.equal(weigh(input).result.status, "PASS", input);
});

test("underweight and overweight give distinct notifications", () => {
  const under = weigh("11910").result;
  const over = weigh("12720").result;
  assert.equal(under.status, "NOT PASS");
  assert.match(under.message, /kurang 390.00/);
  assert.equal(over.status, "NOT PASS");
  assert.match(over.message, /lebih 120.00/);
});

test("empty, nonnumeric, nonfinite, negative and zero weights are rejected", () => {
  for (const input of ["", " ", "NaN", "Infinity", "-1", "0", "12kg", "1e3", "12,3,4"]) {
    const state = weigh(input);
    assert.equal(state.result, null, input);
    assert.notEqual(state.error, "", input);
  }
});

test("measured result is immutable until restart; only NOT PASS can be reported", () => {
  const failed = weigh("11910");
  assert.equal(scanReducer(failed, { type: "weight", value: "12480" }), failed);
  assert.equal(scanReducer(failed, { type: "reported" }).reported, true);
  assert.equal(scanReducer(weigh("12480"), { type: "reported" }).reported, false);
  assert.deepEqual(scanReducer(failed, { type: "reset" }), initialScanState);
});

test("product variants without valid weight standards can be scanned but never graded", () => {
  for (const [min, max] of [[null, null], [null, 12600], [12300, null], [13, 12], [0, 12], [NaN, 12], [12, Infinity]]) {
    const variant = { ...box, model: "Craig", quantity: 100, standardWeightMin: min, standardWeightMax: max };
    const scanned = scanReducer(initialScanState, { type: "scan", code: box.barcode, boxes: [variant] });
    assert.equal(scanned.box.quantity, 100);
    assert.equal(scanReducer(scanned, { type: "weight", value: "12480" }).weight, "");
    const checked = scanReducer(scanned, { type: "check" });
    assert.equal(checked.result, null);
    assert.match(checked.error, /Batas berat/);
  }
});

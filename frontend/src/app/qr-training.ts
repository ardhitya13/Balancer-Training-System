export type TrainingBox = {
  barcode: string;
  lotNumber: string;
  boxNumber: string;
  quantity: number | null;
  fillStatus?: "full" | "not_full";
  actualWeight: number | null;
  standardWeightMin: number | null;
  standardWeightMax: number | null;
  leader?: string;
  line?: string;
  model?: string;
  standardRecorded?: boolean;
};

export function trainingKey(box: TrainingBox) {
  return JSON.stringify([box.barcode, box.lotNumber, box.model ?? "", box.quantity, box.fillStatus ?? "full"]);
}

export type WeightResult = { status: "PASS" | "NOT PASS" | "TERCATAT"; weight: number; message: string };
export type ScanState = { box: TrainingBox | null; weight: string; result: WeightResult | null; error: string; reported: boolean };
export const initialScanState: ScanState = { box: null, weight: "", result: null, error: "", reported: false };
export function hasWeightStandard(box: TrainingBox): box is TrainingBox & { standardWeightMin: number; standardWeightMax: number } {
  const min = box.standardWeightMin;
  const max = box.standardWeightMax;
  return typeof min === "number" && typeof max === "number" && Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min;
}
export type ScanAction =
  | { type: "scan"; code: string; boxes: TrainingBox[] }
  | { type: "weight"; value: string }
  | { type: "check" }
  | { type: "reported" }
  | { type: "reset" };

export function scanReducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case "reset": return initialScanState;
    case "scan": {
      const box = action.boxes.find((item) => item.barcode === action.code.trim());
      return box ? { ...initialScanState, box } : { ...initialScanState, error: "QR tidak terdaftar pada data latihan. Penimbangan belum dibuka." };
    }
    case "weight": return state.box && (hasWeightStandard(state.box) || state.box.standardRecorded) && !state.result ? { ...state, weight: action.value, error: "" } : state;
    case "check": {
      if (!state.box) return { ...state, error: "Scan QR yang terdaftar terlebih dahulu." };
      if (!hasWeightStandard(state.box) && !state.box.standardRecorded) return { ...state, error: "Data standar belum ditimbang. Batas berat belum tersedia. Buka menu Timbangan Standar." };
      if (state.result) return state;
      const normalized = state.weight.trim().replace(",", ".");
      const weight = Number(normalized);
      if (!/^\d+(\.\d+)?$/.test(normalized) || !Number.isFinite(weight) || weight <= 0) {
        return { ...state, error: "Masukkan berat lebih dari 0 gram, misalnya 12480." };
      }
      if (!hasWeightStandard(state.box)) return { ...state, error: "", result: { status: "TERCATAT", weight, message: "Berat tercatat. Rumus batas berat belum dikonfirmasi; belum ada penilaian PASS/NOT PASS." } };
      const { standardWeightMin: min, standardWeightMax: max } = state.box;
      const status = weight >= min && weight <= max ? "PASS" : "NOT PASS";
      const message = status === "PASS" ? "Berat sesuai rentang latihan." : weight < min ? `Berat kurang ${(min - weight).toFixed(2)} gram dari batas bawah.` : `Berat lebih ${(weight - max).toFixed(2)} gram dari batas atas.`;
      return { ...state, error: "", result: { status, weight, message } };
    }
    case "reported": return state.result?.status === "NOT PASS" ? { ...state, reported: true } : state;
  }
}

export type StandardRecord = { operator: string; qr: boolean; boxScanned: boolean; full: number | null; samples: number[]; error: string };
export const initialStandard: StandardRecord = { operator: "", qr: false, boxScanned: false, full: null, samples: [], error: "" };
export function standardComplete(record: StandardRecord) {
  return !!record.operator && record.qr && record.boxScanned && record.full !== null && Number.isFinite(record.full) && record.full > 0 && record.samples.length === 10 && record.samples.every((n) => Number.isFinite(n) && n > 0);
}
export function standardStep(record: StandardRecord) {
  if (!record.operator) return "operator";
  if (!record.qr) return "qr";
  if (!record.boxScanned) return "box";
  if (record.full === null) return "full";
  return record.samples.length < 10 ? "sample" : "done";
}
export function recordStandard(record: StandardRecord, action: { step: string; value: string }, box: TrainingBox): StandardRecord {
  if (action.step !== standardStep(record) || action.step === "done") return { ...record, error: "Selesaikan langkah aktif terlebih dahulu." };
  const value = action.value.trim();
  if (action.step === "operator") return value && value.length <= 40 ? { ...record, operator: value, error: "" } : { ...record, error: "Nomor operator wajib diisi, maksimal 40 karakter." };
  if (action.step === "qr") return value === box.barcode ? { ...record, qr: true, error: "" } : { ...record, error: "QR tidak cocok dengan karton latihan." };
  if (action.step === "box") return value === box.boxNumber ? { ...record, boxScanned: true, error: "" } : { ...record, error: "Nomor box tidak cocok." };
  const normalized = value.replace(",", ".");
  const weight = Number(normalized);
  if (!/^\d+(\.\d+)?$/.test(normalized) || !Number.isFinite(weight) || weight <= 0) return { ...record, error: "Berat harus berupa angka lebih dari 0 gram." };
  return action.step === "full" ? { ...record, full: weight, error: "" } : { ...record, samples: [...record.samples, weight], error: "" };
}

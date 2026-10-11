export const productRules: { model: string; carton: string; tentative: boolean; referenceQuantity?: number; referenceQuantities?: number[] }[] = [
  { model: "Craig", carton: "IK 2", tentative: false, referenceQuantities: [100, 200] },
  { model: "HAV 3P", carton: "Belum dirinci", tentative: true, referenceQuantity: 272 },
  { model: "HAV 3V", carton: "IK 3", tentative: false },
  { model: "HAV 3D", carton: "H (belum pasti)", tentative: true },
  { model: "HAV 3LL", carton: "L", tentative: false },
  { model: "Nasuno", carton: "IK 4", tentative: false },
  { model: "Nasuno M", carton: "IK 4", tentative: false, referenceQuantity: 128 },
  { model: "Nasuno S", carton: "IK 4", tentative: false, referenceQuantity: 256 },
  { model: "Nasuno 3", carton: "IK 4", tentative: false, referenceQuantity: 234 },
];

export type HandlingCase = { lotType?: "fresh" | "rework"; notFull: boolean; destination: "Cartoner" | "Annex"; result: "OK" | "NG"; initiallyWrapped: boolean };
export type HandlingState = { scanned: boolean; received: boolean; wrapped: boolean; identified: boolean; ikPass: boolean; unwrapped: boolean; location: "workstation" | "ng" | "qa" | "trolley" | "pallet"; error: string };
export type HandlingAction = "scan" | "receive" | "wrap" | "identity" | "ik" | "unwrap" | "ng" | "qa" | "trolley" | "pallet";
export const initialHandling: HandlingState = { scanned: false, received: false, wrapped: false, identified: false, ikPass: false, unwrapped: false, location: "workstation", error: "" };

export function allowedHandling(state: HandlingState, item: HandlingCase): HandlingAction[] {
  if (item.lotType === "rework" && !state.scanned) return ["scan"];
  if (!state.received) return ["receive"];
  const actions: HandlingAction[] = [];
  if (state.location === "trolley") return [...actions, "pallet"];
  if (state.location !== "workstation") return actions;
  if (item.result === "NG") return [...actions, item.initiallyWrapped && !state.unwrapped ? "unwrap" : "ng"];
  if (item.notFull && item.destination === "Annex") return [...actions, "qa"];
  if (item.lotType === "rework" && !state.ikPass) return [...actions, "ik"];
  if (!state.wrapped) return [...actions, "wrap"];
  if (!state.ikPass) return [...actions, "ik"];
  if (item.notFull && !state.identified) return [...actions, "identity"];
  return [...actions, "trolley"];
}

export function handleCase(state: HandlingState, action: HandlingAction, item: HandlingCase): HandlingState {
  if (!allowedHandling(state, item).includes(action)) return { ...state, error: "Tindakan belum sesuai tahap atau hasil yang diterima." };
  const next = { ...state, error: "" };
  switch (action) {
    case "scan": return { ...next, scanned: true };
    case "receive": return { ...next, received: true };
    case "wrap": return { ...next, wrapped: true };
    case "identity": return { ...next, identified: true };
    case "ik": return { ...next, ikPass: true };
    case "unwrap": return { ...next, unwrapped: true };
    case "ng": return { ...next, location: "ng" };
    case "qa": return { ...next, location: "qa" };
    case "trolley": return { ...next, location: "trolley" };
    case "pallet": return { ...next, location: "pallet" };
  }
}

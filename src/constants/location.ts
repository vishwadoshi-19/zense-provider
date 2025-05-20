type State = "delhi" | "up" | "haryana"; // DELHI , UTTAR PRADESH ,

const STATES: string[] = ["Delhi", "Mumbai", "Bangalore"];

const DISTRICTS: Record<State, string[]> = {
  delhi: [
    "CENTRAL",
    "EAST",
    "WEST",
    "NORTH",
    "SOUTH",
    "NORTH WEST",
    "NORTH EAST",
    "SOUTH EAST",
    "SOUTH WEST",
    "NEW DELHI",
    "SHAHDARA",
  ],
  up: ["GHAZIABAD", "NOIDA", "MEERUT", "MUZAFFARNAGAR"],
  haryana: ["FARIDABAD", "GURUGRAM", "ROHTAK", "SONIPAT"],
};

export { STATES, DISTRICTS };
export type { State };

export const STATE_OPTIONS = [
  { label: "Delhi", value: "delhi" },
  { label: "UP", value: "up" },
  { label: "Haryana", value: "haryana" },
];

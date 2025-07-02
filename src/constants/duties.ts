// Duties config for staff roles (Nurse, Attendant) as per PRD Annexure A
// Each duty has: category, label, mandatory for Nurse/Attendant, optional, and tooltip (if optional)

export type Duty = {
  key: string;
  label: string;
  category: string;
  mandatoryFor: ("nurse" | "attendant")[];
  optionalFor: ("nurse" | "attendant")[];
  tooltip?: string;
};

export const DUTY_CATEGORIES = [
  "Patient care & hygiene",
  "Medication Management",
  "Vital signs & Health monitoring",
  "Wound care & Medical procedures",
  "Nutrition & Hydration support",
  "Emergency handling & First Aid",
  "Emotional & Psychological support",
  "Reporting and Coordination",
  "Household & Environmental maintenance",
  "Non-essential services",
];

export const DUTIES: Duty[] = [
  // Patient care & hygiene
  {
    key: "grooming_dressing",
    label: "Assist with grooming, dressing",
    category: "Patient care & hygiene",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "oral_skincare",
    label: "Oral care & Skincare",
    category: "Patient care & hygiene",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "mobility_transfers",
    label: "Assist with mobility, transfers",
    category: "Patient care & hygiene",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "toileting",
    label: "Assist with toileting",
    category: "Patient care & hygiene",
    mandatoryFor: ["attendant"],
    optionalFor: ["nurse"],
    tooltip: "Nurses may assist with toileting if required.",
  },
  // Medication Management
  {
    key: "administer_medication",
    label: "Administer prescribed medication",
    category: "Medication Management",
    mandatoryFor: ["nurse"],
    optionalFor: ["attendant"],
    tooltip: "Attendants may assist if trained and permitted.",
  },
  {
    key: "monitor_medication",
    label: "Monitor medication schedule, dosage",
    category: "Medication Management",
    mandatoryFor: ["nurse"],
    optionalFor: ["attendant"],
    tooltip: "Attendants may help monitor if instructed.",
  },
  {
    key: "medication_reminders",
    label: "Medication reminders",
    category: "Medication Management",
    mandatoryFor: ["attendant"],
    optionalFor: ["nurse"],
    tooltip: "Nurses may provide reminders as needed.",
  },
  // Vital signs & Health monitoring
  {
    key: "recording_vitals",
    label: "Recording vitals",
    category: "Vital signs & Health monitoring",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  // Wound care & Medical procedures
  {
    key: "wound_care",
    label: "Dressing and managing wounds",
    category: "Wound care & Medical procedures",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "catheter_tubes",
    label: "Manage catheter, feeding tubes",
    category: "Wound care & Medical procedures",
    mandatoryFor: ["nurse"],
    optionalFor: ["attendant"],
    tooltip: "Attendants may assist if trained and permitted.",
  },
  {
    key: "passive_exercises",
    label: "Passive/Light exercises",
    category: "Wound care & Medical procedures",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  // Nutrition & Hydration support
  {
    key: "meal_planning",
    label: "Meal planning as per doctor's advice",
    category: "Nutrition & Hydration support",
    mandatoryFor: ["nurse"],
    optionalFor: ["attendant"],
    tooltip: "Attendants may help with meal planning if instructed.",
  },
  {
    key: "assist_feeding",
    label: "Assist with feeding",
    category: "Nutrition & Hydration support",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "hydration",
    label: "Ensure adequate hydration",
    category: "Nutrition & Hydration support",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  // Emergency handling & First Aid
  {
    key: "emergency_signs",
    label: "Recognize early emergency signs",
    category: "Emergency handling & First Aid",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "first_aid_cpr",
    label: "Basic first-aid & CPR",
    category: "Emergency handling & First Aid",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  // Emotional & Psychological support
  {
    key: "light_conversation",
    label: "Light conversation & activity",
    category: "Emotional & Psychological support",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "educate_family",
    label: "Educate family on patient care",
    category: "Emotional & Psychological support",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  // Reporting and Coordination
  {
    key: "medication_records",
    label: "Keep medication, treatment records",
    category: "Reporting and Coordination",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "communicate_doctors",
    label: "Communicate with doctors",
    category: "Reporting and Coordination",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  {
    key: "accompany_doctor_visits",
    label: "Accompany for doctor visits",
    category: "Reporting and Coordination",
    mandatoryFor: ["nurse", "attendant"],
    optionalFor: [],
  },
  // Household & Environmental maintenance
  {
    key: "housekeeping",
    label: "Light housekeeping",
    category: "Household & Environmental maintenance",
    mandatoryFor: ["attendant"],
    optionalFor: ["nurse"],
    tooltip: "Nurses may assist with housekeeping if required.",
  },
  {
    key: "change_bed_linens",
    label: "Change bed linens",
    category: "Household & Environmental maintenance",
    mandatoryFor: ["attendant"],
    optionalFor: ["nurse"],
    tooltip: "Nurses may assist with changing bed linens if required.",
  },
  {
    key: "laundry_assistance",
    label: "Laundry assistance",
    category: "Household & Environmental maintenance",
    mandatoryFor: ["attendant"],
    optionalFor: ["nurse"],
    tooltip: "Nurses may assist with laundry if required.",
  },
  // Non-essential services (all optional)
  {
    key: "make_tea_coffee",
    label: "Make tea/coffee or boil milk",
    category: "Non-essential services",
    mandatoryFor: [],
    optionalFor: ["nurse", "attendant"],
    tooltip: "Prepare light beverages for the patient if needed",
  },
  {
    key: "cut_fruits",
    label: "Cut fruits",
    category: "Non-essential services",
    mandatoryFor: [],
    optionalFor: ["nurse", "attendant"],
    tooltip: "Cut and plate fruits for meals or snacks",
  },
  {
    key: "prepare_meals",
    label: "Prepare patient's meals",
    category: "Non-essential services",
    mandatoryFor: [],
    optionalFor: ["nurse", "attendant"],
    tooltip: "Cook meals when a cook is unavailable",
  },
  {
    key: "clean_room",
    label: "Clean patient's room",
    category: "Non-essential services",
    mandatoryFor: [],
    optionalFor: ["nurse", "attendant"],
    tooltip: "Light sweeping or wiping in patient's room",
  },
  {
    key: "wash_clothes",
    label: "Wash patient's clothes",
    category: "Non-essential services",
    mandatoryFor: [],
    optionalFor: ["nurse", "attendant"],
    tooltip: "Wash clothes as part of laundry duties",
  },
  {
    key: "book_cab",
    label: "Book a cab from patient's phone",
    category: "Non-essential services",
    mandatoryFor: [],
    optionalFor: ["nurse", "attendant"],
    tooltip: "Help book cab using patient's mobile",
  },
];

// Utility to get duties for a role, grouped by category
export function getGroupedDutiesByRole(role: "nurse" | "attendant") {
  const grouped: { [category: string]: { mandatory: Duty[]; optional: Duty[] } } = {};
  for (const cat of DUTY_CATEGORIES) {
    grouped[cat] = { mandatory: [], optional: [] };
  }
  for (const duty of DUTIES) {
    if (duty.mandatoryFor.includes(role)) {
      grouped[duty.category].mandatory.push(duty);
    }
    if (duty.optionalFor.includes(role)) {
      grouped[duty.category].optional.push(duty);
    }
  }
  return grouped;
} 
export interface Provider {
  id: string;
  businessName: string;
  ownerName: string;
  yearsInBusiness: number;
  address: string;
  contactNumber: string;
  emergencyContact: string;
  email: string;
  panNumber: string;
  gstNumber: string;
  businessHours: string;
  serviceCities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
}

export interface AvailabilityDateRange {
  startDate: string; // Using string for simplicity, can be Date if needed
  endDate: string; // Using string for simplicity, can be Date if needed
}

export interface Staff {
  id: string;
  phone: string;
  providerId: string;
  name: string;
  type: "Attendant" | "Nurse"; // Consider if other roles are needed
  status: "unregistered" | "registered" | "live";
  contactNumber: string;
  email?: string; // Making email optional as it's not in the current add form
  address?: string; // Making address optional as we're adding structured addresses
  experience: string;
  availability: AvailabilityDateRange[]; // Updated to array of date ranges
  tempAvailability?: boolean; // Temporary availability
  currentAssignment: string | null;
  createdAt: Date;
  updatedAt: Date;

  // New fields
  dateOfBirth?: string; // Using string for simplicity, can be Date
  religion?: string; // Consider using a union type for specific religions
  currentAddress?: Address;
  permanentAddress?: Address;
  isCurrentAddressSameAsPermanent?: boolean;
  isActive: boolean; // Default to false
  aadharVerified: boolean; // Default to false
  policeVerified: boolean; // Default to false
  bankDetails?: BankDetails;
  profilePhoto?: string; // Added based on add.tsx
  expectedWages?: {
    // Added based on add.tsx
    "5hrs": number;
    "12hrs": number;
    "24hrs": number;
  };
  educationQualification?: string; // Added based on add.tsx
  educationCertificate?: string; // Added based on add.tsx
  experienceYears?: string; // Added based on add.tsx (renamed from experience)
  maritalStatus?: string; // Added based on add.tsx
  languagesKnown?: string[]; // Added based on add.tsx
  preferredShifts?: string[]; // Added based on add.tsx
  jobRole?: string; // Added based on add.tsx (renamed from type)
  extraServicesOffered?: string[]; // Added based on add.tsx
  foodPreference?: string; // Added based on add.tsx
  smokes?: string; // Added based on add.tsx
  carryOwnFood12hrs?: string; // Added based on add.tsx
  additionalInfo?: string; // Added based on add.tsx
  selfTestimonial?: {
    // Added based on add.tsx
    customerName: string;
    customerPhone: string;
    recording: string;
  } | null;
  identityDocuments?: {
    // Added based on add.tsx
    aadharNumber: string;
    aadharFront: string;
    aadharBack: string;
    panNumber?: string;
    panDocument?: string;
  };
}

export interface Job {
  id: string;
  providerId: string;
  customerId: string;
  staffId: string | null;
  description: string;
  customerName: string;
  customerAge: number;
  customerGender: "Male" | "Female" | "Other";
  serviceType: "Attendant" | "Nurse" | "Semi-Nurse";
  JobType: "6 Hour" | "12 Hour" | "24 Hour";
  address: string;
  startDate: Date;
  requirements: string[];
  endDate: Date | null;
  status: "Pending" | "assigned" | "completed" | "ongoing";
  notes: string;
  district: string;
  subDistrict: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  staffId: string;
  jobId: string;
  date: Date;
  clockIn: Date | null;
  clockOut: Date | null;
  status: "Present" | "Absent" | "Late";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChargesInfo {
  attendant: {
    shift24: number;
    shift12: number;
    shift6: number;
  };
  semiNurse: {
    shift24: number;
    shift12: number;
    shift6: number;
  };
  nurse: {
    shift24: number;
    shift12: number;
    shift6: number;
  };
}

export interface AvailabilityInfo {
  attendantDuration: string;
  semiNurseDuration: string;
  nurseDuration: string;
}

export interface AdditionalInfo {
  additionalServices: string[];
  replacementTime: string;
  provisionTime: string;
  extraInfo: string;
}

export interface UserData {
  name: string;
  status: "unregistered" | "registered" | "live";
  phone: string;
  profilePhoto?: string;
  previewUrl?: string;
  location?: string;
  gender?: string;
  role: "user" | "provider" | "staff" | "admin";
  lastStep: "details";
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  hasOngoingJob?: boolean; // Added property
}

// export interface FormState {
//   [key: string]:
//     | string
//     | string[]
//     | File
//     | null
//     | number
//     | Address
//     | BankDetails
//     | AvailabilityDateRange[]
//     | boolean;
// }

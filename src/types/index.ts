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

export interface Staff {
  id: string;
  providerId: string;
  name: string;
  type: "Attendant" | "Nurse";
  contactNumber: string;
  email: string;
  address: string;
  experience: string;
  availability: boolean;
  currentAssignment: string | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface StaffDetails {
  name: string;
  phone: string;
  agency: string;
  profilePhoto: string | null;
  location: string;
  gender: string;
  district: string;
  subDistricts: string[];

  providerId: string;
  expectedWages: {
    "5hrs": number;
    "12hrs": number;
    "24hrs": number;
  };
  educationQualification: string;
  educationCertificate: string;
  experienceYears: string;
  maritalStatus: string;
  languagesKnown: string[];
  preferredShifts: string[];
  jobRole: string;
  extraServicesOffered: string[];
  foodPreference: string;
  smokes: string;
  carryOwnFood12hrs: string;
  additionalInfo?: string;
  selfTestimonial?: {
    customerName: string;
    customerPhone: string;
    recording: string;
  } | null;
  identityDocuments: {
    aadharNumber: string;
    aadharFront: string;
    aadharBack: string;
    panNumber?: string;
    panDocument?: string;
  };
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface FormState {
  [key: string]: string | string[] | File | null | number;
}

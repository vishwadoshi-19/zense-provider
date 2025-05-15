export interface StaffData {
  name: string;
  gender: string;
  maritalStatus: string;
  jobRole: string;
  dateOfBirth: string;
  religion: string;
  currentAddress: Address;
  permanentAddress: Address;
  isCurrentAddressSameAsPermanent: boolean;
  isActive: boolean;
  aadharVerified: boolean;
  policeVerified: boolean;
  bankDetails: BankDetails;
  availability: Availability[];
  expectedWages: Wages;
  educationQualification: string;
  educationCertificate: string;
  experienceYears: string;
  preferredShifts: string[];
  languagesKnown: string[];
  extraServicesOffered: string[];
  foodPreference: string;
  smokes: string;
  carryOwnFood12hrs: string;
  additionalInfo: string;
  selfTestimonial: Testimonial | null;
  identityDocuments: IdentityDocuments;
  phone: string;
  status: string;
  providerId: string;
  profilePhoto: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
}

interface Availability {
  startDate: string;
  endDate: string;
}

interface Wages {
  "5hrs": number;
  "12hrs": number;
  "24hrs": number;
}

interface Testimonial {
  customerName: string;
  customerPhone: string;
  recording: string;
}

interface IdentityDocuments {
  aadharNumber: string;
  aadharFront: string;
  aadharBack: string;
  panNumber: string;
  panDocument: string;
}

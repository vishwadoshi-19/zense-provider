interface OrderEntry {
  orderValue: number;
  orderDate: Date;
  paymentDate: Date;
  paymentAmount: number;
}

interface GuardianInfo {
  name: string;
  relationship: string;
  mobile: string;
  email: string;
}

interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  patientId: string;
}

interface AcquisitionInfo {
  mode: "Online" | "Offline";
  channel:
    | "Customer Referral"
    | "Doctor Referral"
    | "Online Marketing"
    | "Other";
  referrerRemarks: string;
}

interface PaymentInfo {
  modeOfPayment: string;
  paymentDate: Date;
  paymentAmount: number;
  refundDate: Date;
  refundAmount: number;
}

interface StaffInfo {
  staffId: string;
  staffName: string;
  staffMobile: string;
}

interface Job {
  jobType: string;
  serviceType: string;
  serviceShift: string;
  jobDuration: number;
  startDate: Date;
  endDate: Date;
  signUpDate: Date;
  description: string;
  requirements: string[];
  notes: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  // Grouped Info
  patientInfo: PatientInfo;
  guardianInfo: GuardianInfo;
  acquisitionInfo: AcquisitionInfo;
  paymentInfo: PaymentInfo;
  staffInfo: StaffInfo;

  pricePerHour: number;

  // Order arrays
  medicineOrders: OrderEntry[];
  diagnosticOrders: OrderEntry[];
  otherOrders: OrderEntry[];
}

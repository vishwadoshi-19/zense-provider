export interface OrderEntry {
  orderValue?: number;
  orderDate?: Date | string;
  paymentDate?: Date | string;
  paymentAmount?: number;
}

export interface GuardianInfo {
  name: string;
  relationship: string;
  mobile: string;
  email: string;
}

export interface PatientInfo {
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

export interface AcquisitionInfo {
  mode: "Online" | "Offline";
  channel:
    | "Customer Referral"
    | "Doctor Referral"
    | "Online Marketing"
    | "Other";
  referrerRemarks: string;
}

export interface PaymentInfo {
  modeOfPayment?: string;
  paymentDate?: Date | string;
  paymentAmount?: number;
  refundDate?: Date | string;
  refundAmount?: number;
}

export interface StaffInfo {
  staffId: string;
  staffName: string;
  staffMobile: string;
}

export interface Job2 {
  id: string;
  jobType: string;
  serviceType: string;
  serviceShift: string;
  jobDuration: number;
  startDate?: Date | string;
  endDate?: Date | string;
  signUpDate?: Date | string;
  description: string;
  requirements: string[];
  notes: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Grouped Info
  patientInfo: Partial<PatientInfo>;
  guardianInfo: Partial<GuardianInfo>;
  acquisitionInfo: Partial<AcquisitionInfo>;
  paymentInfo: Partial<PaymentInfo>;
  staffInfo: Partial<StaffInfo>;

  pricePerHour?: number;

  // Order arrays
  medicineOrders: Array<Partial<OrderEntry>>;
  diagnosticOrders: Array<Partial<OrderEntry>>;
  otherOrders: Array<Partial<OrderEntry>>;

  // Add pin property
  pin?: string;
}

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
  type: 'Attendant' | 'Nurse' | 'Semi-Nurse';
  contactNumber: string;
  email: string;
  address: string;
  experience: number;
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
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  serviceType: 'Attendant' | 'Nurse' | 'Semi-Nurse';
  shiftType: '6 Hour' | '12 Hour' | '24 Hour';
  address: string;
  startDate: Date;
  endDate: Date | null;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string;
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
  status: 'Present' | 'Absent' | 'Late';
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
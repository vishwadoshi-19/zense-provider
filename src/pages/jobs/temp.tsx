import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/common/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Job2,
  PatientInfo,
  GuardianInfo,
  AcquisitionInfo,
  PaymentInfo,
  StaffInfo,
  OrderEntry,
} from "@/types/jobs";
import { Staff } from "@/types"; // Assuming Staff type is still needed for assignment
import { collection, addDoc, getDocs } from "firebase/firestore"; // Added getDocs for fetching staff
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import AssignStaffDialog from "@/components/dashboard/AssignStaffDialog"; // Import AssignStaffDialog
import { UserPlus } from "lucide-react"; // Import UserPlus icon
import { number } from "zod";

interface FormData {
  jobType?: string;
  serviceType?: string;
  serviceShift?: string;
  jobDuration?: number;
  startDate?: string; // Store as string initially from date input
  endDate?: string; // Store as string initially from date input
  signUpDate?: string; // Store as string initially from date input
  description?: string;
  requirements?: string; // Representing as a single string for simplicity in form
  notes?: string;
  status?: string;
  pricePerHour?: number;

  // Nested objects
  patientInfo?: Partial<PatientInfo>;
  guardianInfo?: Partial<GuardianInfo>;
  acquisitionInfo?: Partial<AcquisitionInfo>;
  paymentInfo?: Partial<PaymentInfo>;
  staffInfo?: Partial<StaffInfo>;

  // Order arrays (simplified for form)
  medicineOrders?: OrderEntry[];
  diagnosticOrders?: OrderEntry[];
  otherOrders?: OrderEntry[];
}

const predefinedRequirements = [
  "Experience with elderly care",
  "CPR certified",
  "First aid certified",
  "Fluent in English",
  "Has own transportation",
];

const AddJobPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Job2>({
    id: "",

    jobType: "",
    serviceType: "",
    serviceShift: "",
    jobDuration: 0,
    startDate: "",
    endDate: "",
    signUpDate: "",
    description: "",
    requirements: [],
    notes: "",
    status: "pending",
    pricePerHour: 0,
    patientInfo: {},
    guardianInfo: {},
    acquisitionInfo: {},
    paymentInfo: {},
    staffInfo: {},
    medicineOrders: [],
    diagnosticOrders: [],
    otherOrders: [],
  });
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]); // State for staff list
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false); // State for assign dialog
  const [jobToAssign, setJobToAssign] = useState<Job2 | null>(null); // State for job to assign
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({}); // State for form errors

  // Fetch staff list
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffCollection = collection(db, "users");
        const staffSnapshot = await getDocs(staffCollection);
        const staffData = staffSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Staff)
        );
        setStaffList(staffData);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Handle nested fields (including arrays of objects)
    if (name.includes(".")) {
      const [parent, rest] = name.split(".");
      if (rest.includes(".")) {
        // Handle nested objects within arrays (e.g., medicineOrders.0.orderValue)
        const [index, child] = rest.split(".");
        setFormData((prev) => {
          const parentArray = [
            ...((prev[parent as keyof Job2] as any[]) ?? []),
          ];
          parentArray[Number(index)] = {
            ...(parentArray[Number(index)] as object),
            [child]: value,
          };
          return { ...prev, [parent]: parentArray };
        });
      } else {
        // Handle nested objects (e.g., patientInfo.name)
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Job2] as object),
            [rest]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Job2] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAssignStaffClick = () => {
    // For the add job page, we don't have a job ID yet.
    // We just need to open the dialog to select a staff member.
    setIsAssignDialogOpen(true);
  };

  const handleStaffAssignment = async (staffId: string, staffName: string) => {
    // This function will be called from the AssignStaffDialog
    // Update the formData with the selected staff info
    setFormData((prev) => ({
      ...prev,
      staffInfo: {
        staffId: staffId,
        staffName: staffName,
        staffMobile:
          staffList.find((staff) => staff.id === staffId)?.contactNumber || "", // Assuming contactNumber is mobile
      },
    }));
    setIsAssignDialogOpen(false);
    setJobToAssign(null); // jobToAssign remains null as we are adding a new job
  };

  // Helper functions for managing order arrays
  const addOrderEntry = (
    category: "medicineOrders" | "diagnosticOrders" | "otherOrders"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: [
        ...(prev[category] ?? []),
        { orderValue: 0, orderDate: "", paymentDate: "", paymentAmount: 0 },
      ], // Add a new empty order entry
    }));
  };

  const removeOrderEntry = (
    category: "medicineOrders" | "diagnosticOrders" | "otherOrders",
    index: number
  ) => {
    setFormData((prev) => {
      const orders = [...(prev[category] ?? [])];
      orders.splice(index, 1);
      return { ...prev, [category]: orders };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.uid) {
      console.error("User not logged in");
      return;
    }

    // Basic validation
    const errors: { [key: string]: string } = {};
    if (!formData.startDate) {
      errors.startDate = "Start Date is required";
    }
    if (!formData.endDate) {
      errors.endDate = "End Date is required";
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        errors.endDate = "End Date must be after Start Date";
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.error("Form validation failed", errors);
      return;
    }

    setLoading(true);
    try {
      // Helper function to get string value with default
      const getStringValue = (value: string | undefined) => value ?? "";
      // Helper function to get number value with default
      const getNumberValue = (
        value: number | string | undefined
      ): number | undefined => {
        if (value === undefined) return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
      };
      // Helper function to get Date value from string or Date
      const getDateFromString = (value: string | Date | undefined) => {
        if (!value) return undefined;
        if (value instanceof Date) {
          return value;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
      };

      const newJob: any = {
        id: "", // Firestore will generate this

        // Map formData to Job2 structure with default values and date conversions
        jobType: getStringValue(formData.jobType),
        serviceType: getStringValue(formData.serviceType),
        serviceShift: getStringValue(formData.serviceShift),
        jobDuration: getNumberValue(formData.jobDuration) ?? 0, // Provide a default value of 0
        startDate: getDateFromString(formData.startDate)!, // Use non-null assertion after validation
        endDate: getDateFromString(formData.endDate)!, // Use non-null assertion after validation
        signUpDate: getDateFromString(formData.signUpDate),
        description: getStringValue(formData.description),
        requirements: formData.requirements ?? [], // Use the array directly
        notes: getStringValue(formData.notes),
        status: getStringValue(formData.status) || "pending", // Default status
        pricePerHour: getNumberValue(formData.pricePerHour) || 0,
        createdAt: new Date(),
        updatedAt: new Date(),

        // Handle nested objects with default values for mandatory fields
        patientInfo: {
          name: getStringValue(formData.patientInfo?.name),
          age: getNumberValue(formData.patientInfo?.age) || 0, // Provide a default age
          gender: getStringValue(formData.patientInfo?.gender),
          address: getStringValue(formData.patientInfo?.address),
          city: getStringValue(formData.patientInfo?.city),
          state: getStringValue(formData.patientInfo?.state),
          pincode: getStringValue(formData.patientInfo?.pincode),
          mobile: getStringValue(formData.patientInfo?.mobile),
          patientId: getStringValue(formData.patientInfo?.patientId),
        },
        guardianInfo: {
          name: getStringValue(formData.guardianInfo?.name),
          relationship: getStringValue(formData.guardianInfo?.relationship),
          mobile: getStringValue(formData.guardianInfo?.mobile),
          email: getStringValue(formData.guardianInfo?.email),
        },
        acquisitionInfo: {
          mode: (getStringValue(formData.acquisitionInfo?.mode) ||
            "Offline") as "Online" | "Offline", // Provide a default mode
          channel: (getStringValue(formData.acquisitionInfo?.channel) ||
            "Other") as
            | "Customer Referral"
            | "Doctor Referral"
            | "Online Marketing"
            | "Other", // Provide a default channel
          referrerRemarks: getStringValue(
            formData.acquisitionInfo?.referrerRemarks
          ),
        },
        paymentInfo: {
          modeOfPayment: getStringValue(formData.paymentInfo?.modeOfPayment),
          paymentAmount:
            getNumberValue(formData.paymentInfo?.paymentAmount) || 0, // Provide a default age,
          refundAmount: getNumberValue(formData.paymentInfo?.refundAmount) || 0, // Provide a default age,
          paymentDate: getDateFromString(
            formData?.paymentInfo?.paymentDate instanceof Date
              ? formData.paymentInfo.paymentDate.toISOString().split("T")[0]
              : formData?.paymentInfo?.paymentDate
          ),
          refundDate: getDateFromString(
            formData?.paymentInfo?.refundDate instanceof Date
              ? formData.paymentInfo.refundDate.toISOString().split("T")[0]
              : formData?.paymentInfo?.refundDate
          ),
        } as Partial<PaymentInfo>,
        staffInfo: {
          staffId: getStringValue(formData.staffInfo?.staffId),
          staffName: getStringValue(formData.staffInfo?.staffName),
          staffMobile: getStringValue(formData.staffInfo?.staffMobile),
        },

        // Handle order arrays - conditionally include date fields
        medicineOrders:
          formData.medicineOrders?.map((order) => {
            const convertedOrder: Partial<OrderEntry> = {
              orderValue: order.orderValue,
              paymentAmount: order.paymentAmount || 0, // Provide a default age
              orderDate: getDateFromString(order.orderDate),
              paymentDate: getDateFromString(order.paymentDate),
            };
            return convertedOrder;
          }) ?? [],
        diagnosticOrders:
          formData.diagnosticOrders?.map((order) => {
            const convertedOrder: Partial<OrderEntry> = {
              orderValue: order.orderValue,
              paymentAmount: order.paymentAmount || 0, // Provide a default age
              orderDate: getDateFromString(order.orderDate),
              paymentDate: getDateFromString(order.paymentDate),
            };
            return convertedOrder;
          }) ?? [],
        otherOrders:
          formData.otherOrders?.map((order) => {
            const convertedOrder: Partial<OrderEntry> = {
              orderValue: order.orderValue || 0,
              paymentAmount: order.paymentAmount || 0,
              orderDate: getDateFromString(order.orderDate),
              paymentDate: order.paymentDate
                ? getDateFromString(order.paymentDate)
                : new Date(), // Default to current date if undefined
            };
            return convertedOrder;
          }) ?? [],
      };

      // Add the document without specifying an ID
      await addDoc(collection(db, "jobs"), newJob);
      console.log("Document added with ID: ", newJob.id);
      router.push("/jobs");
    } catch (error) {
      console.error("Error adding job:", error);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Job</h1>
          <p className="text-gray-500 mt-1">
            Fill in the details to create a new job request
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobType">
                Job Type<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange("jobType", value)}
                value={formData.jobType ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attendant">Attendant</SelectItem>
                  <SelectItem value="Nurse">Nurse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="serviceType">
                Service Type<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("serviceType", value)
                }
                value={formData.serviceType ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6 hour">6 hour</SelectItem>
                  <SelectItem value="12 hour">12 hour</SelectItem>
                  <SelectItem value="24 hour">24 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="serviceShift">Service Shift</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("serviceShift", value)
                }
                value={formData.serviceShift ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Service Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div>
              <Label htmlFor="jobDuration">Job Duration (in hours)</Label>
              <Input
                id="jobDuration"
                name="jobDuration"
                type="number"
                value={formData.jobDuration ?? ""}
                onChange={handleChange}
              />
            </div> */}
            <div>
              <Label htmlFor="startDate">
                Start Date<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={
                  formData.startDate instanceof Date
                    ? formData.startDate.toISOString()
                    : formData.startDate ?? ""
                }
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">
                End Date<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={
                  formData.endDate instanceof Date
                    ? formData.endDate.toISOString()
                    : formData.endDate ?? ""
                }
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="signUpDate">Sign Up Date</Label>
              <Input
                id="signUpDate"
                name="signUpDate"
                type="date"
                value={
                  formData.signUpDate instanceof Date
                    ? formData.signUpDate.toISOString()
                    : formData.signUpDate ?? ""
                }
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="pricePerHour">Price Per Hour</Label>
              <Input
                id="pricePerHour"
                name="pricePerHour"
                type="number"
                value={formData.pricePerHour ?? 0}
                onChange={handleChange}
              />
            </div>
            {/* // Removed the status field as it's not needed and set the default
            to "pending" in the formData initialization */}
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <div className="space-y-4">
              {/* Show currently selected requirements with remove option */}
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.requirements?.map((req, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{req}</span>
                    <button
                      type="button"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        const updatedRequirements = [
                          ...(formData.requirements ?? []),
                        ];
                        updatedRequirements.splice(index, 1);
                        setFormData({
                          ...formData,
                          requirements: updatedRequirements,
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Predefined requirements selection */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Add predefined requirement:
                </p>
                <div className="flex flex-wrap gap-2">
                  {predefinedRequirements.map((req) => (
                    <button
                      key={req}
                      type="button"
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm"
                      onClick={() => {
                        const currentReqs = formData.requirements ?? [];

                        if (!currentReqs.includes(req)) {
                          setFormData({
                            ...formData,
                            requirements: [...currentReqs, req],
                          });
                        }
                      }}
                    >
                      + {req}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom requirement input */}
              <div className="flex items-center gap-2">
                <Input
                  id="customRequirement"
                  placeholder="Enter custom requirement"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      const newReq = e.currentTarget.value.trim();
                      const currentReqs = formData.requirements ?? [];

                      if (!currentReqs.includes(newReq)) {
                        setFormData({
                          ...formData,
                          requirements: [...currentReqs, newReq],
                        });
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = document.getElementById(
                      "customRequirement"
                    ) as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const newReq = input.value.trim();
                      const currentReqs = formData.requirements ?? [];

                      if (!currentReqs.includes(newReq)) {
                        setFormData({
                          ...formData,
                          requirements: [...currentReqs, newReq],
                        });
                        input.value = "";
                      }
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes ?? ""}
              onChange={handleChange}
            />
          </div>

          {/* Patient Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientInfo.name">
                  Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="patientInfo.name"
                  name="patientInfo.name"
                  value={formData.patientInfo?.name ?? ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientInfo.age">
                  Age<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="patientInfo.age"
                  name="patientInfo.age"
                  type="number"
                  value={formData.patientInfo?.age ?? ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientInfo.gender">
                  Gender<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("patientInfo.gender", value)
                  }
                  value={formData.patientInfo?.gender ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="patientInfo.address">
                  Address<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="patientInfo.address"
                  name="patientInfo.address"
                  value={formData.patientInfo?.address ?? ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientInfo.state">
                  State<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("patientInfo.state", value)
                  }
                  value={formData.patientInfo?.state ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Haryana">Haryana</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                    {/* <SelectItem value="Rajasthan">Rajasthan</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="patientInfo.city">
                  City<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("patientInfo.city", value)
                  }
                  value={formData.patientInfo?.city ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                    <SelectItem value="Noida">Noida</SelectItem>
                    <SelectItem value="Faridabad">Faridabad</SelectItem>
                    <SelectItem value="Ghaziabad">Ghaziabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="patientInfo.pincode">
                  Pincode<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="patientInfo.pincode"
                  name="patientInfo.pincode"
                  value={formData.patientInfo?.pincode ?? ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientInfo.mobile">
                  Mobile<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="patientInfo.mobile"
                  name="patientInfo.mobile"
                  value={formData.patientInfo?.mobile ?? ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientInfo.patientId">Patient ID</Label>
                <Input
                  id="patientInfo.patientId"
                  name="patientInfo.patientId"
                  value={formData.patientInfo?.patientId ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Guardian Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guardianInfo.name">Name</Label>
                <Input
                  id="guardianInfo.name"
                  name="guardianInfo.name"
                  value={formData.guardianInfo?.name ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="guardianInfo.relationship">Relationship</Label>
                <Input
                  id="guardianInfo.relationship"
                  name="guardianInfo.relationship"
                  value={formData.guardianInfo?.relationship ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="guardianInfo.mobile">Mobile</Label>
                <Input
                  id="guardianInfo.mobile"
                  name="guardianInfo.mobile"
                  value={formData.guardianInfo?.mobile ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="guardianInfo.email">Email</Label>
                <Input
                  id="guardianInfo.email"
                  name="guardianInfo.email"
                  type="email"
                  value={formData.guardianInfo?.email ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Acquisition Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Acquisition Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acquisitionInfo.mode">Mode</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("acquisitionInfo.mode", value)
                  }
                  value={formData.acquisitionInfo?.mode ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="acquisitionInfo.channel">Channel</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("acquisitionInfo.channel", value)
                  }
                  value={formData.acquisitionInfo?.channel ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer Referral">
                      Customer Referral
                    </SelectItem>
                    <SelectItem value="Doctor Referral">
                      Doctor Referral
                    </SelectItem>
                    <SelectItem value="Online Marketing">
                      Online Marketing
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="acquisitionInfo.referrerRemarks">
                  Referrer Remarks
                </Label>
                <Textarea
                  id="acquisitionInfo.referrerRemarks"
                  name="acquisitionInfo.referrerRemarks"
                  value={formData.acquisitionInfo?.referrerRemarks ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentInfo.modeOfPayment">
                  Mode of Payment
                </Label>
                <Input
                  id="paymentInfo.modeOfPayment"
                  name="paymentInfo.modeOfPayment"
                  value={formData.paymentInfo?.modeOfPayment ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="paymentInfo.paymentDate">Payment Date</Label>
                <Input
                  id="paymentInfo.paymentDate"
                  name="paymentInfo.paymentDate"
                  type="date"
                  value={
                    formData?.paymentInfo?.paymentDate instanceof Date
                      ? formData?.paymentInfo?.paymentDate
                          .toISOString()
                          .split("T")[0]
                      : formData?.paymentInfo?.paymentDate ?? ""
                  }
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="paymentInfo.paymentAmount">
                  Payment Amount
                </Label>
                <Input
                  id="paymentInfo.paymentAmount"
                  name="paymentInfo.paymentAmount"
                  type="number"
                  value={formData.paymentInfo?.paymentAmount ?? 0}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="paymentInfo.refundDate">Refund Date</Label>
                <Input
                  id="paymentInfo.refundDate"
                  name="paymentInfo.refundDate"
                  type="date"
                  value={
                    formData.paymentInfo?.refundDate instanceof Date
                      ? formData.paymentInfo.refundDate
                          .toISOString()
                          .split("T")[0]
                      : formData.paymentInfo?.refundDate ?? ""
                  }
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="paymentInfo.refundAmount">Refund Amount</Label>
                <Input
                  id="paymentInfo.refundAmount"
                  name="paymentInfo.refundAmount"
                  type="number"
                  value={formData.paymentInfo?.refundAmount ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Staff Info (for initial assignment) */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Staff Assignment</h2>
            {/* This will be handled by the Assign Staff Dialog */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAssignStaffClick} // No need to pass job data yet
              className="text-xs"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Assign Staff
            </Button>
            {formData.staffInfo?.staffName && (
              <p className="text-sm text-gray-700">
                Assigned Staff: {formData.staffInfo.staffName}
              </p>
            )}
          </div>

          {/* Order Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Order Information</h2>

            {/* Medicine Orders */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Medicine Orders</h3>
              {formData.medicineOrders?.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                >
                  <div>
                    <Label htmlFor={`medicineOrders-${index}-value`}>
                      Value
                    </Label>
                    <Input
                      id={`medicineOrders-${index}-value`}
                      name={`medicineOrders.${index}.orderValue`}
                      type="number"
                      value={(order.orderValue ?? "").toString()}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`medicineOrders-${index}-orderDate`}>
                      Order Date
                    </Label>
                    <Input
                      id={`medicineOrders-${index}-orderDate`}
                      name={`medicineOrders.${index}.orderDate`}
                      type="date"
                      value={
                        order.orderDate instanceof Date
                          ? order.orderDate.toISOString().split("T")[0]
                          : (order.orderDate as unknown as string) ?? ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`medicineOrders-${index}-paymentDate`}>
                      Payment Date
                    </Label>
                    <Input
                      id={`medicineOrders-${index}-paymentDate`}
                      name={`medicineOrders.${index}.paymentDate`}
                      type="date"
                      value={
                        order.paymentDate instanceof Date
                          ? order.paymentDate.toISOString().split("T")[0]
                          : (order.paymentDate as unknown as string) ?? ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`medicineOrders-${index}-paymentAmount`}>
                      Payment Amount
                    </Label>
                    <Input
                      id={`medicineOrders-${index}-paymentAmount`}
                      name={`medicineOrders.${index}.paymentAmount`}
                      type="number"
                      value={(order.paymentAmount ?? "").toString()}
                      onChange={handleChange}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOrderEntry("medicineOrders", index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOrderEntry("medicineOrders")}
              >
                Add Medicine Order
              </Button>
            </div>

            {/* Diagnostic Orders */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Diagnostic Orders</h3>
              {formData.diagnosticOrders?.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                >
                  <div>
                    <Label htmlFor={`diagnosticOrders-${index}-value`}>
                      Value
                    </Label>
                    <Input
                      id={`diagnosticOrders-${index}-value`}
                      name={`diagnosticOrders.${index}.orderValue`}
                      type="number"
                      value={(order.orderValue ?? "").toString()}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`diagnosticOrders-${index}-orderDate`}>
                      Order Date
                    </Label>
                    <Input
                      id={`diagnosticOrders-${index}-orderDate`}
                      name={`diagnosticOrders.${index}.orderDate`}
                      type="date"
                      value={
                        order.orderDate instanceof Date
                          ? order.orderDate.toISOString().split("T")[0]
                          : (order.orderDate as unknown as string) ?? ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`diagnosticOrders-${index}-paymentDate`}>
                      Payment Date
                    </Label>
                    <Input
                      id={`diagnosticOrders-${index}-paymentDate`}
                      name={`diagnosticOrders.${index}.paymentDate`}
                      type="date"
                      value={
                        order.paymentDate instanceof Date
                          ? order.paymentDate.toISOString().split("T")[0]
                          : (order.paymentDate as unknown as string) ?? ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`diagnosticOrders-${index}-paymentAmount`}>
                      Payment Amount
                    </Label>
                    <Input
                      id={`diagnosticOrders-${index}-paymentAmount`}
                      name={`diagnosticOrders.${index}.paymentAmount`}
                      type="number"
                      value={(order.paymentAmount ?? "").toString()}
                      onChange={handleChange}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOrderEntry("diagnosticOrders", index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOrderEntry("diagnosticOrders")}
              >
                Add Diagnostic Order
              </Button>
            </div>

            {/* Other Orders */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Other Orders</h3>
              {formData.otherOrders?.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                >
                  <div>
                    <Label htmlFor={`otherOrders-${index}-value`}>Value</Label>
                    <Input
                      id={`otherOrders-${index}-value`}
                      name={`otherOrders.${index}.orderValue`}
                      type="number"
                      value={(order.orderValue ?? "").toString()}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`otherOrders-${index}-orderDate`}>
                      Order Date
                    </Label>
                    <Input
                      id={`otherOrders-${index}-orderDate`}
                      name={`otherOrders.${index}.orderDate`}
                      type="date"
                      value={
                        order.orderDate instanceof Date
                          ? order.orderDate.toISOString().split("T")[0]
                          : (order.orderDate as unknown as string) ?? ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`otherOrders-${index}-paymentDate`}>
                      Payment Date
                    </Label>
                    <Input
                      id={`otherOrders-${index}-paymentDate`}
                      name={`otherOrders.${index}.paymentDate`}
                      type="date"
                      value={
                        order.paymentDate instanceof Date
                          ? order.paymentDate.toISOString().split("T")[0]
                          : (order.paymentDate as unknown as string) ?? ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`otherOrders-${index}-paymentAmount`}>
                      Payment Amount
                    </Label>
                    <Input
                      id={`otherOrders-${index}-paymentAmount`}
                      name={`otherOrders.${index}.paymentAmount`}
                      type="number"
                      value={(order.paymentAmount ?? "").toString()}
                      onChange={handleChange}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOrderEntry("otherOrders", index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOrderEntry("otherOrders")}
              >
                Add Other Order
              </Button>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 z-10">
            <Button
              type="submit"
              disabled={loading}
              className="shadow-lg rounded-full px-4 py-4 h-auto"
            >
              {loading ? "Adding Job..." : "Add Job"}
              {!loading && <span className="ml-2">→</span>}
            </Button>
          </div>
        </form>
      </div>
      <AssignStaffDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        staffList={staffList}
        jobToAssign={jobToAssign} // This will be null in add page
        onAssign={handleStaffAssignment}
      />
    </Layout>
  );
};

export default AddJobPage;

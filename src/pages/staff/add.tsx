"use client";
import Layout from "@/components/common/Layout";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Mic, StopCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  saveFormData,
  uploadFile,
  updateDoc,
  doc,
  db,
} from "@/lib/firebase/firestore";
import { set } from "date-fns";

import { StaffData } from "@/types/StaffData";
import { useRouter } from "next/router";
import { getGroupedDutiesByRole, Duty } from "@/constants/duties";

const SERVICES = {
  Mobility: [
    "Walking assistance",
    "Turn position in bed",
    "Motion exercises",
    "Light massages",
  ],
  Personal_care: ["Oral hygiene", "Skin care", "Assist in getting dressed"],
  Hygiene: ["Help in toileting", "Changing diapers", "Changing catheter"],
  Nutrition: ["Assist in feeding", "Help in fluid intake"],
  Support: ["Companionship", "Polite conversations"],
  Other: [
    "Give medicine",
    "Accompany for Doctor's visit",
    "Book a cab",
    "Assist during diagnostic tests",
    "Physiotherapy",
    "Giving injection",
    "Change medical dressing",
    "Change drip",
    "Bathing & sponge the customer",
    "Clean the room of customer",
    "Making tea / Boiling milk for customer",
    "Measuring vitals - BP, Sugar etc.",
    "Washing clothes of customer",
    "Jhaadu/Poocha & dusting of customer's room",
    "Cut fruits for customer",
    "Can shave the beard of customer",
  ],
};

const Req = () => <span className="text-red-500 text-sm">*</span>;

const DISTRICTS: string[] = ["Delhi", "Gurgaon", "Noida", "Ghaziabad", "Faridabad"];

import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AddStaffPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("personal-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUserCreated, setIsUserCreated] = useState(false); // New state

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    gender: "",
    maritalStatus: "",
    jobRole: "",
    dateOfBirth: "", // New field
    religion: "", // New field

    // Profile Photo
    profilePhoto: null as File | null,
    profilePhotoURL: "",

    // Wages
    lessThan5Hours: "",
    hours12: "",
    hours24: "",

    // Education
    qualification: "",
    certificate: null as File | null,
    certificateURL: "", // Add a new field for the uploaded file URL
    experience: "",

    // Shift Selection
    preferredShifts: [] as string[],

    // Skills
    languages: [] as string[],
    services: {} as Record<string, string[]>,

    // Additional Info
    foodPreference: "",
    smoking: "",
    carryFood: "",
    additionalInfo: "",

    // Testimonial
    customerName: "",
    customerPhone: "",
    video: null as File | null, // Changed from recording to video

    // ID Proof
    aadharNumber: "",
    aadharFront: null as File | null,
    aadharBack: null as File | null,
    panNumber: "",
    panCard: null as File | null,

    // New fields
    currentAddress: {
      // New field
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    permanentAddress: {
      // New field
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    isCurrentAddressSameAsPermanent: false, // New field
    isActive: false, // New field with default
    aadharVerified: false, // New field with default
    policeVerified: false, // New field with default
    bankDetails: {
      // New field
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      bankBranch: "",
    },
    availability: [] as { startDate: string; endDate: string }[], // New field
    // New fields for Agency and Location
    providerId: "",
    district: [] as string[],
    shiftType: "", // "12h", "24h", or "both"
    shiftTime: "", // "day", "night", or "both"
  });

  const [dutySelections, setDutySelections] = useState<{ [key: string]: boolean }>({});
  const [lastJobRole, setLastJobRole] = useState<string>("");

  // When jobRole changes, reset selections and preselect mandatory duties
  useEffect(() => {
    if (formData.jobRole && formData.jobRole !== lastJobRole) {
      if (lastJobRole) {
        if (!window.confirm("Changing the job role will clear all previous duty selections. Continue?")) {
          setFormData((prev) => ({ ...prev, jobRole: lastJobRole }));
          return;
        }
      }
      const grouped = getGroupedDutiesByRole(formData.jobRole as "nurse" | "attendant");
      const newSelections: { [key: string]: boolean } = {};
      Object.values(grouped).forEach(({ mandatory }) => {
        mandatory.forEach((duty) => {
          newSelections[duty.key] = true;
        });
      });
      setDutySelections(newSelections);
      setLastJobRole(formData.jobRole);
    }
  }, [formData.jobRole]);

  // Handle duty checkbox
  const handleDutyChange = (duty: Duty, checked: boolean) => {
    setDutySelections((prev) => ({ ...prev, [duty.key]: checked }));
  };

  // On submit, build grouped services object
  const buildServicesObject = () => {
    const grouped = getGroupedDutiesByRole(formData.jobRole as "nurse" | "attendant");
    const services: { [category: string]: string[] } = {};
    Object.entries(grouped).forEach(([category, { mandatory, optional }]) => {
      const selected: string[] = [];
      mandatory.forEach((duty) => {
        if (dutySelections[duty.key]) selected.push(duty.label);
      });
      optional.forEach((duty) => {
        if (dutySelections[duty.key]) selected.push(duty.label);
      });
      if (selected.length) services[category] = selected;
    });
    return services;
  };

  // Handle phone number input
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("form data modified : ", formData);
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    category: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      // Handle array fields (like preferredShifts, district, languages)
      if (
        category === "preferredShifts" ||
        category === "district" ||
        category === "languages"
      ) {
        const arr = Array.isArray(prev[category])
          ? [...(prev[category] as string[])]
          : [];
        if (checked) {
          if (!arr.includes(value)) arr.push(value);
        } else {
          const idx = arr.indexOf(value);
          if (idx > -1) arr.splice(idx, 1);
        }
        return { ...prev, [category]: arr };
      }

      // Handle nested object (services)
      const updatedServices = { ...prev.services };

      if (checked) {
        if (!updatedServices[category]) {
          updatedServices[category] = [];
        }
        if (!updatedServices[category].includes(value)) {
          updatedServices[category].push(value);
        }
      } else {
        if (updatedServices[category]) {
          updatedServices[category] = updatedServices[category].filter(
            (item) => item !== value
          );
          if (updatedServices[category].length === 0) {
            delete updatedServices[category];
          }
        }
      }

      return { ...prev, services: updatedServices };
    });
  };

  // Handle file uploads
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  // Handle user creation via API
  const handleCreateUser = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      console.log("User creation failed: Invalid phone number.");
      return;
    }

    setIsLoading(true);
    console.log(
      "Attempting to create user via API with phone number:",
      phoneNumber
    );
    const formattedPhoneNumber = `+91${phoneNumber}`; // Assuming Indian phone numbers

    try {
      const response = await fetch("/api/createStaffUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API Error:", result.message);
        toast({
          title: "User Creation Failed",
          description:
            `${result.message} , Try a different phone number` || "An error occurred during user creation.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (result.alreadyExists) {
        toast({
          title: "Phone Number Already In Use",
          description: result.message || "This number is already in use, try edit option.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("User creation successful via API:", result.uid);
      setUserId(result.uid);
      setIsUserCreated(true); // Set user created state
      toast({
        title: "User Created",
        description: "User created successfully. You can now fill the form.",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while submitting the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("User creation process finished.");
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: "User Not Created",
        description:
          "Please create the user first by entering the phone number and clicking 'Create User'.",
        variant: "destructive",
      });
      console.log("Form submission failed: User not created.");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Attempting to save form data for user:", userId);

      // Upload files and get URLs
      let certificateURL = "";
      let aadharFrontURL = "";
      let aadharBackURL = "";
      let panCardURL = "";
      let videoURL = ""; // Changed from recordingURL
      let profilePhotoURL = ""; // Added for profile photo URL

      if (formData.profilePhoto) {
        console.log("Uploading profile photo...");
        profilePhotoURL = await uploadFile(
          formData.profilePhoto,
          `users/${userId}/profilePhotos/${formData.profilePhoto.name}`
        );
        setFormData((prev) => ({ ...prev, profilePhotoURL })); // Store the uploaded file URL in the new field
        console.log("Profile photo uploaded:", profilePhotoURL);
      }

      if (formData.certificate) {
        console.log("Uploading certificate...");
        certificateURL = await uploadFile(
          formData.certificate,
          `users/${userId}/certificates/${formData.certificate.name}`
        );
        setFormData((prev) => ({ ...prev, certificateURL })); // Store the uploaded file URL in the new field

        // Assuming you want to store the URL in formData as well
        setFormData((prev) => ({ ...prev, certificateURL }));
        console.log("Certificate uploaded:", certificateURL);
      }

      if (formData.aadharFront) {
        console.log("Uploading Aadhar front...");
        aadharFrontURL = await uploadFile(
          formData.aadharFront,
          `users/${userId}/documents/aadhar_front_${formData.aadharFront.name}`
        );
        setFormData((prev) => ({ ...prev, aadharFrontURL })); // Store the uploaded file URL in the new field
        console.log("Aadhar front uploaded:", aadharFrontURL);
      }

      if (formData.aadharBack) {
        console.log("Uploading Aadhar back...");
        aadharBackURL = await uploadFile(
          formData.aadharBack,
          `users/${userId}/documents/aadhar_back_${formData.aadharBack.name}`
        );
        setFormData((prev) => ({ ...prev, aadharBackURL })); // Store the uploaded file URL in the new field
        console.log("Aadhar back uploaded:", aadharBackURL);
      }

      if (formData.panCard) {
        console.log("Uploading PAN card...");
        panCardURL = await uploadFile(
          formData.panCard,
          `users/${userId}/documents/pan_${formData.panCard.name}`
        );
        setFormData((prev) => ({ ...prev, panCardURL })); // Store the uploaded file URL in the new field
        console.log("PAN card uploaded:", panCardURL);
      }

      if (formData.video) {
        // Changed from recording
        console.log("Uploading video...");
        videoURL = await uploadFile(
          // Changed from recordingURL
          formData.video, // Changed from recording
          `users/${userId}/testimonials/${formData.video.name}` // Changed path
        );
        setFormData((prev) => ({ ...prev, videoURL })); // Store the uploaded file URL in the new field
        console.log("Video uploaded:", videoURL); // Changed log
      }

      // Prepare data for saving

      const dataToSave: any = {
        phone: phoneNumber ? `+91${phoneNumber}` : "", // Add phone number from state
        providerId: formData.providerId || "", // Include new field
        status: "unregistered", // Set initial status
        // Map formData to the structure expected by saveFormData in firestore.ts
        name: formData.fullName || "",
        gender: formData.gender || "",
        jobRole: formData.jobRole || "",
        maritalStatus: formData.maritalStatus || "",
        dateOfBirth: formData.dateOfBirth || "", // New field
        religion: formData.religion || "", // New field
        currentAddress: formData.currentAddress, // New field
        permanentAddress: formData.isCurrentAddressSameAsPermanent
          ? formData.currentAddress // Use current address if same
          : formData.permanentAddress, // Otherwise use permanent address
        isCurrentAddressSameAsPermanent:
          formData.isCurrentAddressSameAsPermanent, // New field
        isActive: formData.isActive, // New field
        aadharVerified: formData.aadharVerified, // New field
        policeVerified: formData.policeVerified, // New field
        bankDetails: formData.bankDetails, // New field
        availability: formData.availability, // New field
        expectedWages: {
          "5hrs": parseFloat(formData.lessThan5Hours) || 0,
          "12hrs": parseFloat(formData.hours12) || 0,
          "24hrs": parseFloat(formData.hours24) || 0,
        },
        educationQualification: formData.qualification || "",
        educationCertificate: certificateURL || "", // Pass URL after upload
        experienceYears: formData.experience || "", // Ensure experience is saved as string
        preferredShifts: formData.preferredShifts || [],
        languagesKnown: formData.languages || [],
        extraServicesOffered: buildServicesObject(),
        foodPreference: formData.foodPreference || "",
        smokes: formData.smoking || "",
        carryOwnFood12hrs: formData.carryFood || "",
        additionalInfo: formData.additionalInfo || "",
        selfTestimonial: videoURL
          ? {
              customerName: formData.customerName || "",
              customerPhone: formData.customerPhone || "",
              recording: videoURL,
            }
          : null, // Map to object or null
        profilePhoto: profilePhotoURL || "", // Include profile photo URL
        identityDocuments: {
          aadharNumber: formData.aadharNumber || "",
          aadharFront: aadharFrontURL || "", // Pass URL after upload
          aadharBack: aadharBackURL || "", // Pass URL after upload
          panNumber: formData.panNumber || "",
          panDocument: panCardURL || "", // Use panDocument for consistency
        },
        district: formData.district || [], // Include new field
        shiftType: formData.shiftType,
        shiftTime: formData.shiftTime,
        services: buildServicesObject(),
        // Add other fields as needed based on firexport_basic_1745844871617.json and FormState type
      };

      console.log("Saving form data:", dataToSave);
      // Save form data
      const saveResult = await saveFormData(userId, dataToSave as any); // Cast to any for now, will refine type later if needed
      console.log("Save form data result:", saveResult);

      if (saveResult.success) {
        // Update status to "registered" after successful form submission
        console.log("Updating user status to 'registered' for user:", userId);
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { status: "registered" });
        console.log("User status updated to 'registered'.");

        setIsSuccess(true);
        toast({
          title: "Registration Successful",
          description: "Staff member has been registered successfully",
        });
        console.log("Registration successful.");
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register staff member. Please try again.",
          variant: "destructive",
        });
        console.log("Registration failed.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while submitting the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("Form submission process finished.");
    }
  };
  const router = useRouter();
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-6">
            Provider Staff Registration
          </h1>

          {isSuccess ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">
                    Registration Successful
                  </h2>
                  <p className="text-muted-foreground text-center mb-6">
                    The staff member has been successfully registered in the
                    system.
                  </p>
                  <div className="flex space-x-4">
                    {/* <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setPhoneNumber("");
                      setUserId("");
                      setIsUserCreated(false); // Reset user created state
                      setFormData({
                        fullName: "",
                        gender: "",
                        maritalStatus: "",
                        jobRole: "",
                        dateOfBirth: "", // New field
                        religion: "", // New field
                        profilePhoto: null,
                        profilePhotoURL: "",
                        lessThan5Hours: "",
                        hours12: "",
                        hours24: "",
                        qualification: "",
                        certificate: null,
                        certificateURL: "",
                        experience: "",
                        preferredShifts: [],
                        languages: [],
                        services: {},
                        foodPreference: "",
                        smoking: "",
                        carryFood: "",
                        additionalInfo: "",
                        customerName: "",
                        customerPhone: "",
                        video: null, // Changed from recording
                        aadharNumber: "",
                        aadharFront: null,
                        aadharBack: null,
                        panNumber: "",
                        panCard: null,
                        currentAddress: {
                          // New field
                          street: "",
                          city: "",
                          state: "",
                          zip: "",
                        },
                        permanentAddress: {
                          // New field
                          street: "",
                          city: "",
                          state: "",
                          zip: "",
                        },
                        isCurrentAddressSameAsPermanent: false, // New field
                        isActive: false, // New field with default
                        aadharVerified: false, // New field with default
                        policeVerified: false, // New field with default
                        bankDetails: {
                          // New field
                          accountName: "",
                          accountNumber: "",
                          ifscCode: "",
                          bankName: "",
                          bankBranch: "",
                        },
                        availability: [] as {
                          startDate: string;
                          endDate: string;
                        }[], // New field
                        providerId: "", // Reset new field
                        district: [], // Reset new field
                        shiftType: "", // Reset new field
                        shiftTime: "", // Reset new field
                      });
                    }}
                  >
                    Register Another Staff
                  </Button> */}
                    <Button
                      onClick={() => {
                        router.push("/staff");
                      }}
                    >
                      Back to all Staff
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {!isUserCreated ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Phone Number</CardTitle>
                    <CardDescription>
                      Enter the staff member's phone number to create a user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <div className="flex gap-2">
                          {" "}
                          {/* Added gap for button */}
                          <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                            +91
                          </div>
                          <Input
                            id="phoneNumber"
                            placeholder="Enter 10-digit phone number"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            className="rounded-l-none flex-grow" // Allow input to grow
                            minLength={10}
                            maxLength={10}
                            required
                          />
                          <Button
                            type="button"
                            onClick={handleCreateUser}
                            disabled={isLoading || phoneNumber.length !== 10}
                          >
                            {isLoading ? "Creating User..." : "Create User"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Staff Registration Form</CardTitle>
                      <CardDescription>
                        Fill in the details to register a new staff member
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full flex flex-wrap gap-2 mb-6">
                          <TabsTrigger
                            value="personal-info"
                            className="flex-1 text-xs md:text-sm whitespace-nowrap"
                          >
                            Personal Info
                          </TabsTrigger>
                          <TabsTrigger
                            value="other-details"
                            className="flex-1 text-xs md:text-sm whitespace-nowrap"
                          >
                            Other Details
                          </TabsTrigger>
                          <TabsTrigger
                            value="professional"
                            className="flex-1 text-xs md:text-sm whitespace-nowrap"
                          >
                            Professional
                          </TabsTrigger>
                          <TabsTrigger
                            value="agency-location"
                            className="flex-1 text-xs md:text-sm whitespace-nowrap"
                          >
                            Agency & Location
                          </TabsTrigger>
                          <TabsTrigger
                            value="preferences"
                            className="flex-1 text-xs md:text-sm whitespace-nowrap"
                          >
                            Preferences
                          </TabsTrigger>
                          <TabsTrigger
                            value="bank-details"
                            className="flex-1 text-xs md:text-sm whitespace-nowrap"
                          >
                            Bank Details
                          </TabsTrigger>
                          <TabsTrigger
                            value="documents"
                            className="flex-1 text-xs md:text-sm whitespace-nowrap"
                          >
                            Documents
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="personal-info"
                          className="space-y-6"
                        >
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Personal Information
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="fullName">
                                  Full Name <Req />{" "}
                                </Label>
                                <Input
                                  id="fullName"
                                  name="fullName"
                                  placeholder="Enter full name"
                                  value={formData.fullName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gender">
                                  Gender <Req />
                                </Label>
                                <Select
                                  value={formData.gender}
                                  onValueChange={(value) =>
                                    handleSelectChange("gender", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">
                                      Female
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Profile Photo Input */}
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="profilePhoto">
                                  Profile Photo <Req />
                                </Label>
                                <div className="flex items-center gap-4">
                                  {formData.profilePhoto && (
                                    // Display preview of the selected image
                                    <img
                                      src={URL.createObjectURL(
                                        formData.profilePhoto
                                      )}
                                      alt="Profile Preview"
                                      className="w-24 h-24 object-cover rounded-md"
                                    />
                                  )}
                                  <div className="flex-1 space-y-2">
                                    <Input
                                      id="profilePhoto"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleFileChange(e, "profilePhoto")
                                      }
                                      className="flex-1"
                                      required
                                    />
                                    {formData.profilePhoto && (
                                      <div className="text-sm text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Selected</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="maritalStatus">
                                  Marital Status <Req />
                                </Label>
                                <Select
                                  value={formData.maritalStatus}
                                  onValueChange={(value) =>
                                    handleSelectChange("maritalStatus", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select marital status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single">
                                      Single
                                    </SelectItem>
                                    <SelectItem value="married">
                                      Married
                                    </SelectItem>
                                    <SelectItem value="divorced">
                                      Divorced
                                    </SelectItem>
                                    <SelectItem value="widowed">
                                      Widowed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="jobRole">
                                  Job Role <Req />
                                </Label>
                                <Select
                                  value={formData.jobRole}
                                  onValueChange={(value) =>
                                    handleSelectChange("jobRole", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select job role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="nurse">Nurse</SelectItem>
                                    {/* <SelectItem value="caregiver">
                                    Caregiver
                                  </SelectItem>
                                  <SelectItem value="physiotherapist">
                                    Physiotherapist
                                  </SelectItem> */}
                                    <SelectItem value="attendant">
                                      Attendant
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Wages Information
                            </h3>

                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor="lessThan5Hours">
                                  Less than 5 hours (₹)
                                </Label>
                                <Input
                                  id="lessThan5Hours"
                                  name="lessThan5Hours"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={formData.lessThan5Hours}
                                  onChange={handleInputChange}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="hours12">
                                  12 hours shift (₹)
                                </Label>
                                <Input
                                  id="hours12"
                                  name="hours12"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={formData.hours12}
                                  onChange={handleInputChange}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="hours24">
                                  24 hours shift (₹)
                                </Label>
                                <Input
                                  id="hours24"
                                  name="hours24"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={formData.hours24}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Other Details Tab */}
                        <TabsContent
                          value="other-details"
                          className="space-y-6"
                        >
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Other Details
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Date of Birth */}
                              <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">
                                  Date of Birth <Req />
                                </Label>
                                <Input
                                  id="dateOfBirth"
                                  name="dateOfBirth"
                                  type="date"
                                  value={formData.dateOfBirth}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>

                              {/* Religion */}
                              <div className="space-y-2">
                                <Label htmlFor="religion">
                                  Religion <Req />
                                </Label>
                                <Select
                                  value={formData.religion}
                                  onValueChange={(value) =>
                                    handleSelectChange("religion", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select religion" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hindu">Hindu</SelectItem>
                                    <SelectItem value="muslim">
                                      Muslim
                                    </SelectItem>
                                    <SelectItem value="christian">
                                      Christian
                                    </SelectItem>
                                    <SelectItem value="sikh">Sikh</SelectItem>
                                    <SelectItem value="buddhist">
                                      Buddhist
                                    </SelectItem>
                                    <SelectItem value="jain">Jain</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <Separator />

                            {/* Current Address */}
                            <div className="space-y-4">
                              <h4 className="text-md font-medium">
                                Current Address
                              </h4>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="currentAddress.street">
                                    Street <Req />
                                  </Label>
                                  <Input
                                    id="currentAddress.street"
                                    name="currentAddress.street"
                                    placeholder="Street Address"
                                    value={formData.currentAddress.street}
                                    required
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        currentAddress: {
                                          ...prev.currentAddress,
                                          street: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="currentAddress.city">
                                    City <Req />
                                  </Label>
                                  <Input
                                    id="currentAddress.city"
                                    name="currentAddress.city"
                                    placeholder="City"
                                    value={formData.currentAddress.city}
                                    required
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        currentAddress: {
                                          ...prev.currentAddress,
                                          city: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="currentAddress.state">
                                    State <Req />
                                  </Label>
                                  <Input
                                    id="currentAddress.state"
                                    name="currentAddress.state"
                                    placeholder="State"
                                    value={formData.currentAddress.state}
                                    required
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        currentAddress: {
                                          ...prev.currentAddress,
                                          state: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="currentAddress.zip">
                                    Zip Code <Req />
                                  </Label>
                                  <Input
                                    id="currentAddress.zip"
                                    name="currentAddress.zip"
                                    placeholder="Zip Code"
                                    value={formData.currentAddress.zip}
                                    required
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        currentAddress: {
                                          ...prev.currentAddress,
                                          zip: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Permanent Address */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 mb-4">
                                <Checkbox
                                  id="isCurrentAddressSameAsPermanent"
                                  checked={
                                    formData.isCurrentAddressSameAsPermanent
                                  }
                                  onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      isCurrentAddressSameAsPermanent:
                                        checked as boolean,
                                    }))
                                  }
                                />
                                <Label
                                  htmlFor="isCurrentAddressSameAsPermanent"
                                  className="font-normal"
                                >
                                  Permanent Address is same as Current Address
                                </Label>
                              </div>

                              {!formData.isCurrentAddressSameAsPermanent && (
                                <>
                                  <h4 className="text-md font-medium">
                                    Permanent Address
                                  </h4>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="permanentAddress.street">
                                        Street <Req />
                                      </Label>
                                      <Input
                                        id="permanentAddress.street"
                                        name="permanentAddress.street"
                                        placeholder="Street Address"
                                        value={formData.permanentAddress.street}
                                        required={
                                          formData.isCurrentAddressSameAsPermanent ==
                                          false
                                        }
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            permanentAddress: {
                                              ...prev.permanentAddress,
                                              street: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="permanentAddress.city">
                                        City <Req />
                                      </Label>
                                      <Input
                                        id="permanentAddress.city"
                                        name="permanentAddress.city"
                                        placeholder="City"
                                        value={formData.permanentAddress.city}
                                        required={
                                          formData.isCurrentAddressSameAsPermanent ==
                                          false
                                        }
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            permanentAddress: {
                                              ...prev.permanentAddress,
                                              city: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="permanentAddress.state">
                                        State <Req />
                                      </Label>
                                      <Input
                                        id="permanentAddress.state"
                                        name="permanentAddress.state"
                                        placeholder="State"
                                        value={formData.permanentAddress.state}
                                        required={
                                          formData.isCurrentAddressSameAsPermanent ==
                                          false
                                        }
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            permanentAddress: {
                                              ...prev.permanentAddress,
                                              state: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="permanentAddress.zip">
                                        Zip Code <Req />
                                      </Label>
                                      <Input
                                        id="permanentAddress.zip"
                                        name="permanentAddress.zip"
                                        placeholder="Zip Code"
                                        value={formData.permanentAddress.zip}
                                        required={
                                          formData.isCurrentAddressSameAsPermanent ==
                                          false
                                        }
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            permanentAddress: {
                                              ...prev.permanentAddress,
                                              zip: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            <Separator />

                            {/* Verification Status */}
                            <div className="space-y-4">
                              <h4 className="text-md font-medium">
                                Verification Status
                              </h4>
                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        isActive: checked as boolean,
                                      }))
                                    }
                                  />
                                  <Label
                                    htmlFor="isActive"
                                    className="font-normal"
                                  >
                                    Is Active
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="aadharVerified"
                                    checked={formData.aadharVerified}
                                    onCheckedChange={(checked) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        aadharVerified: checked as boolean,
                                      }))
                                    }
                                  />
                                  <Label
                                    htmlFor="aadharVerified"
                                    className="font-normal"
                                  >
                                    Aadhar Verified
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="policeVerified"
                                    checked={formData.policeVerified}
                                    onCheckedChange={(checked) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        policeVerified: checked as boolean,
                                      }))
                                    }
                                  />
                                  <Label
                                    htmlFor="policeVerified"
                                    className="font-normal"
                                  >
                                    Police Verified
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Availability */}
                            {/* <div className="space-y-2">
                            <Label htmlFor="availability">
                              Availability (Format: [[start,end],[start,end]])
                            </Label>
                            <Textarea
                              id="availability"
                              name="availability"
                              placeholder="Enter availability date ranges"
                              value={JSON.stringify(formData.availability)} // Display as string for now
                              onChange={(e) => {
                                try {
                                  setFormData((prev) => ({
                                    ...prev,
                                    availability: JSON.parse(e.target.value),
                                  }));
                                } catch (error) {
                                  console.error(
                                    "Invalid availability format",
                                    error
                                  );
                                  // Optionally show a toast error
                                }
                              }}
                              rows={4}
                            />
                            <p className="text-sm text-muted-foreground">
                              Enter as an array of date pairs, e.g.,
                              `[["12/05/2025","17/05/2024"],["24/05/2025","29/05/2024"]]`
                            </p>
                          </div> */}
                          </div>
                        </TabsContent>

                        <TabsContent value="professional" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Education & Experience
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="qualification">
                                  Qualification <Req />
                                </Label>
                                <Select
                                  value={formData.qualification}
                                  onValueChange={(value) =>
                                    handleSelectChange("qualification", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select qualification" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="below-10th">
                                      Below 10th
                                    </SelectItem>
                                    <SelectItem value="10th">
                                      10th Pass
                                    </SelectItem>
                                    <SelectItem value="12th">
                                      12th Pass
                                    </SelectItem>
                                    <SelectItem value="diploma">
                                      Diploma
                                    </SelectItem>
                                    <SelectItem value="graduate">
                                      Graduate
                                    </SelectItem>
                                    <SelectItem value="anm">ANM</SelectItem>
                                    <SelectItem value="gnm">GNM</SelectItem>
                                    <SelectItem value="bsc">BSC</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="experience">
                                  Experience <Req />
                                </Label>
                                <Select
                                  value={formData.experience}
                                  onValueChange={(value) =>
                                    handleSelectChange("experience", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select experience" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="less-than-1">
                                      Less than 1 Year
                                    </SelectItem>
                                    <SelectItem value="1-2">
                                      1-2 Years
                                    </SelectItem>
                                    <SelectItem value="2-5">
                                      2-5 Years
                                    </SelectItem>
                                    <SelectItem value="5-10">
                                      5-10 Years
                                    </SelectItem>
                                    <SelectItem value="10+">
                                      10+ Years
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="certificate">
                                  Education Certificate <Req />
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id="certificate"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                      handleFileChange(e, "certificate")
                                    }
                                    required
                                    className="flex-1"
                                  />
                                  {formData.certificate && (
                                    <div className="text-sm text-green-600 flex items-center gap-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span>Uploaded</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Skills & Languages
                            </h3>

                            <div className="space-y-3">
                              <Label>Languages Known</Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {[
                                  "Hindi",
                                  "English",
                                  "Bengali",
                                  "Tamil",
                                  "Telugu",
                                  "Kannada",
                                  "Malayalam",
                                  "Marathi",
                                  "Gujarati",
                                ].map((language) => (
                                  <div
                                    key={language}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`lang-${language}`}
                                      checked={formData.languages.includes(
                                        language.toLowerCase()
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleCheckboxChange(
                                          "languages",
                                          language.toLowerCase(),
                                          checked as boolean
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`lang-${language}`}
                                      className="font-normal"
                                    >
                                      {language}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-3 text-lg font-medium">
                              <Label className="text-lg font-medium">Duties (Annexure A)</Label>
                              {formData.jobRole ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(getGroupedDutiesByRole(formData.jobRole as "nurse" | "attendant")).map(
                                    ([category, group]: [string, { mandatory: Duty[]; optional: Duty[] }]) => (
                                      <div key={category} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                        <h4 className="text-base font-semibold mb-2 text-gray-800">{category}</h4>
                                        <div className="space-y-1">
                                          {group.mandatory.map((duty: Duty) => (
                                            <label key={duty.key} className="flex items-center gap-2 cursor-pointer hover:bg-green-50 rounded px-1 py-0.5 relative group">
                                              <Checkbox
                                                id={`duty-${duty.key}`}
                                                checked={!!dutySelections[duty.key]}
                                                onCheckedChange={(checked) => handleDutyChange(duty, checked as boolean)}
                                                disabled
                                              />
                                              <span className="text-sm text-green-700 font-medium flex items-center">
                                                {duty.label}
                                                {duty.tooltip && (
                                                  <span className="ml-2 cursor-help relative flex items-center">
                                                    <Info className="h-4 w-4 text-green-500" />
                                                    <span className="absolute left-1/2 z-10 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 -translate-x-1/2 mt-1 whitespace-nowrap min-w-max">
                                                      {duty.tooltip}
                                                    </span>
                                                  </span>
                                                )}
                                              </span>
                                            </label>
                                          ))}
                                          {group.optional.map((duty: Duty) => (
                                            <label key={duty.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 relative group">
                                              <Checkbox
                                                id={`duty-${duty.key}`}
                                                checked={!!dutySelections[duty.key]}
                                                onCheckedChange={(checked) => handleDutyChange(duty, checked as boolean)}
                                              />
                                              <span className="text-sm text-gray-700 flex items-center">
                                                {duty.label}
                                                {duty.tooltip && (
                                                  <span className="ml-2 cursor-help relative flex items-center">
                                                    <Info className="h-4 w-4 text-gray-400" />
                                                    <span className="absolute left-1/2 z-10 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 -translate-x-1/2 mt-1 whitespace-nowrap min-w-max">
                                                      {duty.tooltip}
                                                    </span>
                                                  </span>
                                                )}
                                              </span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">Select a job role to see duties</div>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="agency-location"
                          className="space-y-6"
                        >
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Provider Agency & Location
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Provider Agency */}
                              <div className="space-y-2">
                                <Label htmlFor="providerAgency">
                                  Provider Agency <Req />
                                </Label>
                                <Select
                                  value={formData.providerId}
                                  onValueChange={(value) =>
                                    handleSelectChange("providerId", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select agency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="zense">Zense</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Districts */}
                              <div className="space-y-3">
                                <Label>
                                  Districts to Serve <Req />
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {DISTRICTS.map((district) => (
                                    <div
                                      key={district}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`district-${district}`}
                                        checked={formData.district.includes(
                                          district.toLowerCase()
                                        )}
                                        onCheckedChange={(checked) =>
                                          handleCheckboxChange(
                                            "district",
                                            district.toLowerCase(),
                                            checked as boolean
                                          )
                                        }
                                        required
                                      />
                                      <Label
                                        htmlFor={`district-${district}`}
                                        className="font-normal"
                                      >
                                        {district}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="preferences" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Personal Preferences
                            </h3>

                            <div className=" grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="foodPreference">
                                  Food Preference <Req />
                                </Label>
                                <Select
                                  value={formData.foodPreference}
                                  onValueChange={(value) =>
                                    handleSelectChange("foodPreference", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select food preference" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="veg">Veg</SelectItem>
                                    <SelectItem value="non-veg">
                                      Non-Veg
                                    </SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="smoking">
                                  Smoking Habit <Req />
                                </Label>
                                <RadioGroup
                                  value={formData.smoking}
                                  onValueChange={(value) =>
                                    handleSelectChange("smoking", value)
                                  }
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="no"
                                      id="smoking-no"
                                    />
                                    <Label
                                      htmlFor="smoking-no"
                                      className="font-normal"
                                    >
                                      No
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="yes"
                                      id="smoking-yes"
                                    />
                                    <Label
                                      htmlFor="smoking-yes"
                                      className="font-normal"
                                    >
                                      Yes
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">Shift Preferences</h3>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="shiftType">Shift Type <Req /></Label>
                                  <Select
                                    value={formData.shiftType}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, shiftType: value }))}
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select shift type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="12h">12 Hours</SelectItem>
                                      <SelectItem value="24h">24 Hours</SelectItem>
                                      <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="shiftTime">Shift Time <Req /></Label>
                                  <Select
                                    value={formData.shiftTime}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, shiftTime: value }))}
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select shift time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="day">Day</SelectItem>
                                      <SelectItem value="night">Night</SelectItem>
                                      <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="additionalInfo">
                                Additional Information
                              </Label>
                              <Textarea
                                id="additionalInfo"
                                name="additionalInfo"
                                placeholder="Any additional information about the staff member"
                                value={formData.additionalInfo}
                                onChange={handleInputChange}
                                rows={4}
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* <div className="space-y-4">
                            <h3 className="text-lg font-medium">Testimonial</h3>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="customerName">
                                  Customer Name
                                </Label>
                                <Input
                                  id="customerName"
                                  name="customerName"
                                  placeholder="Enter customer name"
                                  value={formData.customerName}
                                  onChange={handleInputChange}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="customerPhone">
                                  Customer Phone
                                </Label>
                                <Input
                                  id="customerPhone"
                                  name="customerPhone"
                                  placeholder="Enter customer phone"
                                  value={formData.customerPhone}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="video">Video Testimonial</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="video"
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleFileChange(e, "video")}
                                  className="flex-1"
                                />
                                {formData.video && (
                                  <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Uploaded</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div> */}
                        </TabsContent>

                        {/* Bank Details Tab */}
                        <TabsContent value="bank-details" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Bank Details
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="bankDetails.accountName">
                                  Account Name
                                </Label>
                                <Input
                                  id="bankDetails.accountName"
                                  name="bankDetails.accountName"
                                  placeholder="Name on Account"
                                  value={formData.bankDetails.accountName}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      bankDetails: {
                                        ...prev.bankDetails,
                                        accountName: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bankDetails.accountNumber">
                                  Account Number
                                </Label>
                                <Input
                                  id="bankDetails.accountNumber"
                                  name="bankDetails.accountNumber"
                                  placeholder="Account Number"
                                  value={formData.bankDetails.accountNumber}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      bankDetails: {
                                        ...prev.bankDetails,
                                        accountNumber: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bankDetails.ifscCode">
                                  IFSC Code
                                </Label>
                                <Input
                                  id="bankDetails.ifscCode"
                                  name="bankDetails.ifscCode"
                                  placeholder="IFSC Code"
                                  value={formData.bankDetails.ifscCode}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      bankDetails: {
                                        ...prev.bankDetails,
                                        ifscCode: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bankDetails.bankName">
                                  Bank Name
                                </Label>
                                <Input
                                  id="bankDetails.bankName"
                                  name="bankDetails.bankName"
                                  placeholder="Bank Name"
                                  value={formData.bankDetails.bankName}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      bankDetails: {
                                        ...prev.bankDetails,
                                        bankName: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bankDetails.bankBranch">
                                  Bank Branch
                                </Label>
                                <Input
                                  id="bankDetails.bankBranch"
                                  name="bankDetails.bankBranch"
                                  placeholder="Bank Branch"
                                  value={formData.bankDetails.bankBranch}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      bankDetails: {
                                        ...prev.bankDetails,
                                        bankBranch: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              ID Proof Documents
                            </h3>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="aadharNumber">
                                  Aadhar Number <Req />
                                </Label>
                                <Input
                                  id="aadharNumber"
                                  name="aadharNumber"
                                  placeholder="Enter 12-digit Aadhar number"
                                  value={formData.aadharNumber}
                                  onChange={handleInputChange}
                                  type="number"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  minLength={12}
                                  maxLength={12}
                                />
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="aadharFront">
                                    Aadhar Front <Req />
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="aadharFront"
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      onChange={(e) =>
                                        handleFileChange(e, "aadharFront")
                                      }
                                      className="flex-1"
                                      required
                                    />
                                    {formData.aadharFront && (
                                      <div className="text-sm text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Uploaded</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="aadharBack">
                                    Aadhar Back <Req />
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="aadharBack"
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      onChange={(e) =>
                                        handleFileChange(e, "aadharBack")
                                      }
                                      className="flex-1"
                                      required
                                    />
                                    {formData.aadharBack && (
                                      <div className="text-sm text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Uploaded</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="panNumber">PAN Number</Label>
                                <Input
                                  id="panNumber"
                                  name="panNumber"
                                  placeholder="Enter 10-character PAN number"
                                  value={formData.panNumber}
                                  onChange={handleInputChange}
                                  type="text"
                                  inputMode="text"
                                  minLength={10}
                                  maxLength={10}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="panCard">PAN Card</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id="panCard"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) =>
                                      handleFileChange(e, "panCard")
                                    }
                                    className="flex-1"
                                  />
                                  {formData.panCard && (
                                    <div className="text-sm text-green-600 flex items-center gap-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span>Uploaded</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const tabs = [
                            "personal-info",
                            "other-details",
                            "professional",
                            "agency-location",
                            "preferences",
                            "bank-details",
                            "documents",
                          ];
                          const currentIndex = tabs.indexOf(activeTab);
                          if (currentIndex > 0) {
                            setActiveTab(tabs[currentIndex - 1]);
                          }
                        }}
                        disabled={activeTab === "personal-info"}
                      >
                        Previous
                      </Button>

                      {activeTab !== "documents" && (
                        <Button
                          type="button"
                          onClick={() => {
                            const tabs = [
                              "personal-info",
                              "other-details",
                              "professional",
                              "agency-location",
                              "preferences",
                              "bank-details",
                              "documents",
                            ];
                            const currentIndex = tabs.indexOf(activeTab);
                            if (currentIndex < tabs.length - 1) {
                              setActiveTab(tabs[currentIndex + 1]);
                            }
                          }}
                        >
                          Next
                        </Button>
                      )}

                      <div className="fixed bottom-4 right-4 z-50">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="shadow-lg"
                        >
                          {isSubmitting ? "Submitting..." : "Register Staff"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </form>
              )}
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AddStaffPage;

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
import { AlertCircle, CheckCircle2, Mic, StopCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useRouter } from "next/navigation";

import {
  saveFormData,
  uploadFile,
  updateDoc,
  doc,
  db,
  getStaffDetails,
} from "@/lib/firebase/firestore";
import { set } from "date-fns";

import { StaffData } from "@/types/StaffData";
import { getDoc } from "firebase/firestore";
import { array, boolean } from "zod";
import { te } from "date-fns/locale";

const Req = () => <span className="text-red-500 text-sm">*</span>;

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

type District = "delhi" | "mumbai" | "bangalore";

const DISTRICTS: string[] = ["Delhi", "Mumbai", "Bangalore"];

const SUB_DISTRICTS: Record<District, string[]> = {
  delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  mumbai: [
    "Colaba",
    "Dadar",
    "Andheri",
    "Bandra",
    "Borivali",
    "Goregaon",
    "Juhu",
    "Kurla",
    "Mulund",
    "Powai",
    "Vikhroli",
  ],
  bangalore: [
    "Bangalore East",
    "Bangalore North",
    "Bangalore South",
    "Yelahanka",
    "KR Puram",
    "Jayanagar",
    "Rajajinagar",
    "BTM Layout",
    "Malleswaram",
    "Basavanagudi",
    "Whitefield",
    "Electronic City",
  ],
};

const EditStaffPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
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
    status: "",
    maritalStatus: "",
    jobRole: "",
    dateOfBirth: "",
    religion: "",

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
    certificateURL: "",
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
    video: null as File | null,
    videoURL: "", // Added URL field for video

    // ID Proof
    aadharNumber: "",
    aadharFront: null as File | null,
    aadharBack: null as File | null,
    aadharFrontURL: "", // Added URL field for aadhar front
    aadharBackURL: "", // Added URL field for aadhar back
    panNumber: "",
    panCard: null as File | null,
    panCardURL: "", // Added URL field for pan card

    // New fields
    currentAddress: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    permanentAddress: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    isCurrentAddressSameAsPermanent: false,
    isActive: false,
    aadharVerified: false,
    policeVerified: false,
    bankDetails: {
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      bankBranch: "",
    },
    availability: [] as { startDate: string; endDate: string }[],
    providerId: "",
    district: [] as string[],
    subDistricts: [] as string[],
    tempAvailability: true, // Added tempAvailability to the state
  });

  // Get staff ID from URL
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect to load staff details
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Get the staff ID from the URL
        const pathSegments = window.location.pathname.split("/");
        const staffId = pathSegments[pathSegments.length - 1];

        if (!staffId) {
          setError("No staff ID found in URL");
          setIsLoading(false);
          return;
        }

        setUserId(staffId);

        // Get staff details
        const result = await getStaffDetails(staffId);

        if (result && result.success && result.data) {
          // Populate the form with staff details
          const staffData = result.data as any;
          console.log("Staff data loaded:", staffData);

          setFormData({
            tempAvailability: staffData.tempAvailability,
            fullName: staffData.name || "",
            gender: staffData.gender || "",
            status: staffData.status || "",
            maritalStatus: staffData.maritalStatus || "",
            jobRole: staffData.jobRole || "",
            dateOfBirth: staffData.dateOfBirth || "",
            religion: staffData.religion || "",
            profilePhoto: null,
            profilePhotoURL: staffData.profilePhoto || "",
            lessThan5Hours: staffData.expectedWages?.["5hrs"]?.toString() || "",
            hours12: staffData.expectedWages?.["12hrs"]?.toString() || "",
            hours24: staffData.expectedWages?.["24hrs"]?.toString() || "",
            qualification: staffData.educationQualification || "",
            certificate: null as File | null,
            certificateURL: staffData.educationCertificate || "",
            experience: staffData.experienceYears || "",
            preferredShifts: staffData.preferredShifts || [],
            languages: staffData.languagesKnown || [],
            services: staffData.extraServicesOffered || {},
            foodPreference: staffData.foodPreference || "",
            smoking: staffData.smokes || "",
            carryFood: staffData.carryOwnFood12hrs || "",
            additionalInfo: staffData.additionalInfo || "",
            customerName: staffData.selfTestimonial?.customerName || "",
            customerPhone: staffData.selfTestimonial?.customerPhone || "",
            video: null as File | null,
            videoURL: staffData.selfTestimonial?.recording || "",
            aadharNumber: staffData.identityDocuments?.aadharNumber || "",
            aadharFront: null as File | null,
            aadharFrontURL: staffData.identityDocuments?.aadharFront || "",
            aadharBackURL: staffData.identityDocuments?.aadharBack || "",
            aadharBack: null as File | null,
            panNumber: staffData.identityDocuments?.panNumber || "",
            panCard: null as File | null,
            panCardURL: staffData.identityDocuments?.panDocument || "",
            currentAddress: staffData.currentAddress || {
              street: "",
              city: "",
              state: "",
              zip: "",
            },
            permanentAddress: staffData.permanentAddress || {
              street: "",
              city: "",
              state: "",
              zip: "",
            },
            isCurrentAddressSameAsPermanent:
              staffData.isCurrentAddressSameAsPermanent || false,
            isActive: staffData.isActive || false,
            aadharVerified: staffData.aadharVerified || false,
            policeVerified: staffData.policeVerified || false,
            bankDetails: staffData.bankDetails || {
              accountName: "",
              accountNumber: "",
              ifscCode: "",
              bankName: "",
              bankBranch: "",
            },
            availability: staffData.availability || [],
            providerId: staffData.providerId || "",
            district: staffData.district || [],
            subDistricts: staffData.subDistricts || [],
          });

          // Set phone number
          if (staffData.phone) {
            const phoneWithoutCode = staffData.phone.replace("+91", "");
            setPhoneNumber(phoneWithoutCode);
          }

          // Set user as created
          setIsUserCreated(true);
        } else {
          setError("Failed to load staff details");
        }
      } catch (err) {
        console.error("Error loading staff details:", err);
        setError("An error occurred while loading staff details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
    // Only log after data has been successfully loaded
    if (typeof formData.district === "string") {
      const temp = formData.district;
      setFormData((prev) => ({
        ...prev,
        district: [temp as string],
      }));
    }
    if (!isLoading && !error) {
      console.log(
        "Fetching staff data and populating formData completed:",
        formData
      );
    }
  }, []);

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
    service: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const updatedServices = { ...prev.services };

      if (checked) {
        // Add the service to the category array
        if (!updatedServices[category]) {
          updatedServices[category] = [];
        }
        if (!updatedServices[category].includes(service.toLowerCase())) {
          updatedServices[category].push(service.toLowerCase());
        }
      } else {
        // Remove the service from the category array
        if (updatedServices[category]) {
          updatedServices[category] = updatedServices[category].filter(
            (item) => item !== service.toLowerCase()
          );
          // Optional: Remove the category key if the array becomes empty
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
      console.log("Attempting to save form data for user (edit user):", userId);

      // Upload files and get URLs - preserve existing URLs if no new file is selected
      let certificateURL = formData.certificateURL || "";
      let aadharFrontURL = formData.aadharFrontURL || "";
      let aadharBackURL = formData.aadharBackURL || "";
      let panCardURL = formData.panCardURL || "";
      let videoURL = formData.videoURL || "";
      let profilePhotoURL = formData.profilePhotoURL || "";

      if (formData.profilePhoto) {
        console.log("Uploading profile photo...");
        profilePhotoURL = await uploadFile(
          formData.profilePhoto,
          `users/${userId}/profilePhotos/${formData.profilePhoto.name}`
        );
        console.log("Profile photo uploaded:", profilePhotoURL);
      }

      if (formData.certificate) {
        console.log("Uploading certificate...");
        certificateURL = await uploadFile(
          formData.certificate,
          `users/${userId}/certificates/${formData.certificate.name}`
        );
        console.log("Certificate uploaded:", certificateURL);
      }

      // Get existing document data to preserve URLs if no new file is uploaded
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      // For identity documents, preserve existing URLs if no new file is uploaded
      aadharFrontURL = userData?.identityDocuments?.aadharFront || "";
      aadharBackURL = userData?.identityDocuments?.aadharBack || "";
      panCardURL = userData?.identityDocuments?.panDocument || "";

      if (formData.aadharFront) {
        console.log("Uploading Aadhar front...");
        aadharFrontURL = await uploadFile(
          formData.aadharFront,
          `users/${userId}/documents/aadhar_front_${formData.aadharFront.name}`
        );
        console.log("Aadhar front uploaded:", aadharFrontURL);
      }

      if (formData.aadharBack) {
        console.log("Uploading Aadhar back...");
        aadharBackURL = await uploadFile(
          formData.aadharBack,
          `users/${userId}/documents/aadhar_back_${formData.aadharBack.name}`
        );
        console.log("Aadhar back uploaded:", aadharBackURL);
      }

      if (formData.panCard) {
        console.log("Uploading PAN card...");
        panCardURL = await uploadFile(
          formData.panCard,
          `users/${userId}/documents/pan_${formData.panCard.name}`
        );
        console.log("PAN card uploaded:", panCardURL);
      }

      if (formData.video) {
        console.log("Uploading video...");
        videoURL = await uploadFile(
          formData.video,
          `users/${userId}/testimonials/${formData.video.name}`
        );
        console.log("Video uploaded:", videoURL);
      }

      // Prepare data for saving
      const dataToSave: any = {
        tempAvailability: formData.tempAvailability,
        providerId: formData.providerId || "",
        status: formData?.status || "registered",
        name: formData.fullName || "",
        gender: formData.gender || "",
        jobRole: formData.jobRole || "",
        maritalStatus: formData.maritalStatus || "",
        dateOfBirth: formData.dateOfBirth || "",
        religion: formData.religion || "",
        currentAddress: formData.currentAddress,
        permanentAddress: formData.isCurrentAddressSameAsPermanent
          ? formData.currentAddress
          : formData.permanentAddress,
        isCurrentAddressSameAsPermanent:
          formData.isCurrentAddressSameAsPermanent,
        isActive: formData.isActive,
        aadharVerified: formData.aadharVerified,
        policeVerified: formData.policeVerified,
        bankDetails: formData.bankDetails,
        availability: formData.availability,
        expectedWages: {
          "5hrs": parseFloat(formData.lessThan5Hours) || 0,
          "12hrs": parseFloat(formData.hours12) || 0,
          "24hrs": parseFloat(formData.hours24) || 0,
        },
        educationQualification: formData.qualification || "",
        educationCertificate: certificateURL || "",
        experienceYears: formData.experience || "",
        preferredShifts: formData.preferredShifts || [],
        languagesKnown: formData.languages || [],
        extraServicesOffered: formData.services,
        foodPreference: formData.foodPreference || "",
        smokes: formData.smoking || "",
        carryOwnFood12hrs: formData.carryFood || "",
        additionalInfo: formData.additionalInfo || "",
        selfTestimonial: {
          customerName: formData.customerName || "",
          customerPhone: formData.customerPhone || "",
          recording: videoURL || userData?.selfTestimonial?.recording || "",
        },
        profilePhoto: profilePhotoURL || "",
        identityDocuments: {
          aadharNumber: formData.aadharNumber || "",
          aadharFront: aadharFrontURL || "",
          aadharBack: aadharBackURL || "",
          panNumber: formData.panNumber || "",
          panDocument: panCardURL || "",
        },
        district: formData.district || [],
        subDistricts: formData.subDistricts || [],
        services: formData.services || {},
      };

      console.log("Saving form data:", dataToSave);
      console.log("temp availability", dataToSave.tempAvailability);
      // Save form data
      const saveResult = await saveFormData(userId, dataToSave as any);
      if ("tempAvailability" in saveResult) {
        console.log("Save form data result:", saveResult.tempAvailability);
      } else {
        console.log("Save form data result does not include tempAvailability.");
      }

      if (saveResult.success) {
        setIsSuccess(true);
        toast({
          title: "Update Successful",
          description: "Staff member has been updated successfully",
        });
        console.log("Update successful.");
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update staff member. Please try again.",
          variant: "destructive",
        });
        console.log("Update failed.");
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
  console.log("Form data before rendering:", formData);
  const router = useRouter();

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Update Staff</h1>
        {isSuccess ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Updation Successful
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                  The staff member has been updated registered in the system.
                </p>
                <Button
                  onClick={() => {
                    router.push("/staff");
                    setIsSuccess(false);
                    setUserId("");
                  }}
                >
                  Back to All Staff
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Staff Edit Form for : +91{phoneNumber}</CardTitle>

                  <CardDescription>Edit staff member details</CardDescription>
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

                    <TabsContent value="personal-info" className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Personal Information
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">
                              Full Name <Req />
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
                                <SelectItem value="female">Female</SelectItem>
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
                              {formData.profilePhoto ? (
                                // Display preview of the newly selected image
                                <img
                                  src={URL.createObjectURL(
                                    formData.profilePhoto
                                  )}
                                  alt="Profile Preview"
                                  className="w-24 h-24 object-cover rounded-md"
                                />
                              ) : formData.profilePhotoURL ? (
                                // Display existing uploaded image
                                <img
                                  src={formData.profilePhotoURL}
                                  alt="Current Profile"
                                  className="w-24 h-24 object-cover rounded-md"
                                />
                              ) : null}
                              <div className="flex-1 space-y-2">
                                <Input
                                  id="profilePhoto"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileChange(e, "profilePhoto")
                                  }
                                  className="flex-1"
                                  required={!formData.profilePhotoURL}
                                />
                                {(formData.profilePhoto ||
                                  formData.profilePhotoURL) && (
                                  <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>
                                      {formData.profilePhoto
                                        ? "Selected"
                                        : "Current"}
                                    </span>
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
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="divorced">
                                  Divorced
                                </SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
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

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="status">
                            Staff Status <Req />
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) =>
                              handleSelectChange("status", value)
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unregistered">
                                Unregistered
                              </SelectItem>
                              <SelectItem value="registered">
                                Registered
                              </SelectItem>
                              <SelectItem value="live">Live</SelectItem>
                              <SelectItem value="suspended">
                                Suspended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">
                            Staff Availability <Req />
                          </Label>
                          <Select
                            value={
                              formData.tempAvailability
                                ? "available"
                                : "unavailable"
                            }
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                tempAvailability: value === "available",
                              }))
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">
                                Available
                              </SelectItem>
                              <SelectItem value="unavailable">
                                Unvailable
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Label htmlFor="hours12">12 hours shift (₹)</Label>
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
                            <Label htmlFor="hours24">24 hours shift (₹)</Label>
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
                    <TabsContent value="other-details" className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Other Details</h3>

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
                                <SelectItem value="muslim">Muslim</SelectItem>
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
                              checked={formData.isCurrentAddressSameAsPermanent}
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
                                      !formData.isCurrentAddressSameAsPermanent
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
                                      !formData.isCurrentAddressSameAsPermanent
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
                                      !formData.isCurrentAddressSameAsPermanent
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
                                      !formData.isCurrentAddressSameAsPermanent
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
                              <Label htmlFor="isActive" className="font-normal">
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
                                <SelectItem value="10th">10th Pass</SelectItem>
                                <SelectItem value="12th">12th Pass</SelectItem>
                                <SelectItem value="diploma">Diploma</SelectItem>
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
                              Experience <Req />{" "}
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
                                <SelectItem value="1-2">1-2 Years</SelectItem>
                                <SelectItem value="2-5">2-5 Years</SelectItem>
                                <SelectItem value="5-10">5-10 Years</SelectItem>
                                <SelectItem value="10+">10+ Years</SelectItem>
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
                                required={!formData.certificateURL}
                                className="flex-1"
                              />
                              {formData.certificate ? (
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>New File Selected</span>
                                </div>
                              ) : formData.certificateURL ? (
                                <div className="text-sm text-blue-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <a
                                    href={formData.certificateURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    View Existing
                                  </a>
                                </div>
                              ) : null}
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
                                  checked={
                                    Array.isArray(formData.languages) &&
                                    formData.languages.some(
                                      (lang) =>
                                        lang.toLowerCase() ===
                                        language.toLowerCase()
                                    )
                                  }
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        languages: [
                                          ...(prev.languages || []),
                                          language.toLowerCase(),
                                        ],
                                      }));
                                    } else {
                                      setFormData((prev) => ({
                                        ...prev,
                                        languages: prev.languages.filter(
                                          (lang) =>
                                            lang.toLowerCase() !==
                                            language.toLowerCase()
                                        ),
                                      }));
                                    }
                                  }}
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
                          <Label className="text-lg font-medium">
                            Additional Services
                          </Label>
                          {Object.entries(SERVICES).map(
                            ([category, services]) => (
                              <div key={category} className="space-y-2">
                                <h4 className="text-sm font-medium">
                                  {category}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {services.map((service) => (
                                    <div
                                      key={service}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`service-${service}`}
                                        checked={
                                          formData.services[category]?.includes(
                                            service.toLowerCase()
                                          ) || false
                                        }
                                        onCheckedChange={(checked) =>
                                          handleCheckboxChange(
                                            category,
                                            service.toLowerCase(),
                                            checked as boolean
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={`service-${service}`}
                                        className="font-normal"
                                      >
                                        {service}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="agency-location" className="space-y-6">
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
                                    required
                                    id={`district-${district}`}
                                    checked={
                                      Array.isArray(formData.district) &&
                                      formData.district.includes(
                                        district.toLowerCase()
                                      )
                                    }
                                    onCheckedChange={(checked) => {
                                      const lowerCaseDistrict =
                                        district.toLowerCase();
                                      setFormData((prev) => {
                                        const currentDistricts = Array.isArray(
                                          prev.district
                                        )
                                          ? prev.district
                                          : [];
                                        let updatedDistricts;
                                        if (checked) {
                                          updatedDistricts = [
                                            ...currentDistricts,
                                            lowerCaseDistrict,
                                          ];
                                        } else {
                                          updatedDistricts =
                                            currentDistricts.filter(
                                              (item) =>
                                                item !== lowerCaseDistrict
                                            );
                                        }

                                        // When a district is unchecked, remove its subdistricts
                                        let updatedSubDistricts = Array.isArray(
                                          prev.subDistricts
                                        )
                                          ? prev.subDistricts
                                          : [];
                                        if (!checked) {
                                          const normalizedDistrict =
                                            lowerCaseDistrict as District;
                                          const subdistrictsToRemove =
                                            SUB_DISTRICTS[
                                              normalizedDistrict
                                            ]?.map((sub) =>
                                              sub.toLowerCase()
                                            ) || [];
                                          updatedSubDistricts =
                                            updatedSubDistricts.filter(
                                              (sub) =>
                                                !subdistrictsToRemove.includes(
                                                  sub
                                                )
                                            );
                                        }

                                        return {
                                          ...prev,
                                          district: updatedDistricts,
                                          subDistricts: updatedSubDistricts, // Update subdistricts based on district selection
                                        };
                                      });
                                    }}
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

                          {/* Subdistricts */}
                          {/* Sub-districts based on selected districts */}
                          {Array.isArray(formData.district) &&
                            formData.district.length > 0 && (
                              <div className="space-y-3 md:col-span-2">
                                <Label>
                                  Subdistricts to Serve <Req />
                                </Label>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Checkbox
                                    required
                                    id="all-subdistricts"
                                    checked={
                                      Array.isArray(formData.district) &&
                                      formData.district.length > 0 &&
                                      Array.isArray(formData.subDistricts) &&
                                      formData.subDistricts.length > 0 && // Ensure subDistricts is not empty
                                      formData.subDistricts.length ===
                                        formData.district.reduce(
                                          (acc, district) => {
                                            const normalizedDistrict =
                                              district.toLowerCase() as District;
                                            return (
                                              acc +
                                              (SUB_DISTRICTS[normalizedDistrict]
                                                ?.length || 0)
                                            );
                                          },
                                          0
                                        )
                                    }
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        // Select all subdistricts from selected districts
                                        const allSubdistricts: string[] = [];
                                        if (Array.isArray(formData?.district)) {
                                          formData.district.forEach(
                                            (district) => {
                                              const normalizedDistrict =
                                                district.toLowerCase() as District;
                                              if (
                                                SUB_DISTRICTS[
                                                  normalizedDistrict
                                                ] &&
                                                Array.isArray(
                                                  SUB_DISTRICTS[
                                                    normalizedDistrict
                                                  ]
                                                )
                                              ) {
                                                SUB_DISTRICTS[
                                                  normalizedDistrict
                                                ].forEach((subdistrict) => {
                                                  allSubdistricts.push(
                                                    subdistrict.toLowerCase()
                                                  );
                                                });
                                              }
                                            }
                                          );
                                        }

                                        setFormData((prev) => ({
                                          ...prev,
                                          subDistricts: allSubdistricts,
                                        }));
                                      } else {
                                        // Deselect all subdistricts
                                        setFormData((prev) => ({
                                          ...prev,
                                          subDistricts: [],
                                        }));
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor="all-subdistricts"
                                    className="font-normal"
                                  >
                                    Select All Subdistricts <Req />
                                  </Label>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {Array.isArray(formData.district) &&
                                    formData?.district?.map((district) => {
                                      const normalizedDistrict =
                                        district.toLowerCase() as District;
                                      // Ensure SUB_DISTRICTS[normalizedDistrict] is an array before mapping
                                      return (
                                        Array.isArray(
                                          SUB_DISTRICTS[normalizedDistrict]
                                        ) &&
                                        SUB_DISTRICTS[normalizedDistrict]?.map(
                                          (subdistrict) => (
                                            <div
                                              key={subdistrict}
                                              className="flex items-center space-x-2"
                                            >
                                              <Checkbox
                                                required
                                                id={`subdistrict-${subdistrict}`}
                                                checked={
                                                  Array.isArray(
                                                    formData?.subDistricts
                                                  ) &&
                                                  formData?.subDistricts?.includes(
                                                    subdistrict.toLowerCase()
                                                  )
                                                }
                                                onCheckedChange={(checked) => {
                                                  const lowerCaseSubdistrict =
                                                    subdistrict.toLowerCase();
                                                  setFormData((prev) => {
                                                    const currentSubDistricts =
                                                      Array.isArray(
                                                        prev.subDistricts
                                                      )
                                                        ? prev.subDistricts
                                                        : [];
                                                    if (checked) {
                                                      // Add only if not already present
                                                      if (
                                                        !currentSubDistricts.includes(
                                                          lowerCaseSubdistrict
                                                        )
                                                      ) {
                                                        return {
                                                          ...prev,
                                                          subDistricts: [
                                                            ...currentSubDistricts,
                                                            lowerCaseSubdistrict,
                                                          ],
                                                        };
                                                      }
                                                    } else {
                                                      return {
                                                        ...prev,
                                                        subDistricts:
                                                          currentSubDistricts.filter(
                                                            (item) =>
                                                              item !==
                                                              lowerCaseSubdistrict
                                                          ),
                                                      };
                                                    }
                                                    return prev; // Return previous state if no change
                                                  });
                                                }}
                                              />
                                              <Label
                                                htmlFor={`subdistrict-${subdistrict}`}
                                                className="font-normal"
                                              >
                                                {subdistrict}
                                              </Label>
                                            </div>
                                          )
                                        )
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Personal Preferences
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="foodPreference">
                              Food Preference <Req />
                            </Label>
                            <Select
                              value={formData.foodPreference}
                              onValueChange={(value) =>
                                handleSelectChange("foodPreference", value)
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select food preference" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="veg">Veg</SelectItem>
                                <SelectItem value="non-veg">Non-Veg</SelectItem>
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
                              required
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="smoking-no" />
                                <Label
                                  htmlFor="smoking-no"
                                  className="font-normal"
                                >
                                  No
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="smoking-yes" />
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

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Shift Preferences
                          </h3>

                          <div className="space-y-3">
                            <Label>Preferred Shifts</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {[
                                "Morning (6AM-2PM)",
                                "Afternoon (2PM-10PM)",
                                "Night (10PM-6AM)",
                                "Full Day (9AM-6PM)",
                                "24 Hours",
                                "Part Time",
                                "Flexible Hours",
                              ].map((shift) => (
                                <div
                                  key={shift}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`shift-${shift}`}
                                    checked={
                                      Array.isArray(formData.preferredShifts) &&
                                      formData.preferredShifts.some(
                                        (s) =>
                                          s.toLowerCase() ===
                                          shift.toLowerCase()
                                      )
                                    }
                                    onCheckedChange={(checked) => {
                                      setFormData((prev) => {
                                        if (checked) {
                                          return {
                                            ...prev,
                                            preferredShifts: [
                                              ...(prev.preferredShifts || []),
                                              shift,
                                            ],
                                          };
                                        } else {
                                          return {
                                            ...prev,
                                            preferredShifts:
                                              prev.preferredShifts.filter(
                                                (s) =>
                                                  s.toLowerCase() !==
                                                  shift.toLowerCase()
                                              ),
                                          };
                                        }
                                      });
                                    }}
                                  />
                                  <Label
                                    htmlFor={`shift-${shift}`}
                                    className="font-normal"
                                  >
                                    {shift}
                                  </Label>
                                </div>
                              ))}
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

                      {/* <div className="space-y-4">
                        <h3 className="text-lg font-medium">Testimonial</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="customerName">Customer Name</Label>
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
                        <h3 className="text-lg font-medium">Bank Details</h3>
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
                              minLength={12}
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={12}
                              required
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
                                  required={!formData.aadharFrontURL}
                                  className="flex-1"
                                />
                                {formData.aadharFront ? (
                                  <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>New File Selected</span>
                                  </div>
                                ) : formData.aadharFrontURL ? (
                                  <div className="text-sm text-blue-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <a
                                      href={formData.aadharFrontURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline"
                                    >
                                      View Existing
                                    </a>
                                  </div>
                                ) : null}
                              </div>
                              {/* {formData.aadharFrontURL && (
                              <div className="mt-2">
                                <img
                                  src={formData.aadharFrontURL}
                                  alt="Aadhar Front"
                                  className="max-h-32 rounded-md border"
                                />
                              </div>
                            )} */}
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
                                  required={!formData.aadharBackURL}
                                  className="flex-1"
                                />
                                {formData.aadharBack ? (
                                  <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>New File Selected</span>
                                  </div>
                                ) : formData.aadharBackURL ? (
                                  <div className="text-sm text-blue-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <a
                                      href={formData.aadharBackURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline"
                                    >
                                      View Existing
                                    </a>
                                  </div>
                                ) : null}
                              </div>
                              {/* {formData.aadharBackURL && (
                              <div className="mt-2">
                                <img
                                  src={formData.aadharBackURL}
                                  alt="Aadhar Back"
                                  className="max-h-32 rounded-md border"
                                />
                              </div>
                            )} */}
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
                                onChange={(e) => handleFileChange(e, "panCard")}
                                className="flex-1"
                              />
                              {formData.panCard ? (
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>New File Selected</span>
                                </div>
                              ) : formData.panCardURL ? (
                                <div className="text-sm text-blue-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <a
                                    href={formData.panCardURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    View Existing
                                  </a>
                                </div>
                              ) : null}
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
                      {isSubmitting ? "Updating..." : "Update Staff"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
};

export default EditStaffPage;

// {/* <div>
//   <h1 className="text-3xl font-bold">Add New Staff</h1>
//   {/* Add your form for adding staff here */}
//   <p>Form to add new staff will go here.</p>
// </div> */}

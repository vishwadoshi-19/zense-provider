"use client";
import Layout from "@/components/common/Layout";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { DateRange, Range } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format, isWithinInterval, parse } from "date-fns";
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { uploadFile } from "@/lib/firebase/firestore"; // Import uploadFile
import { Staff, Address, BankDetails, AvailabilityDateRange } from "@/types"; // Import new interfaces

export const getStaffDetails = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as any; // Cast to the new Staff interface
      console.log("User data:", userData);
      if (userData && userData.providerId) {
        console.log("Staff details found:", userData);
        return {
          success: true,
          data: userData,
        };
      }
    }
  } catch (error) {
    console.error("Error getting staff details:", error);
    return { success: false, error };
  }
};

const EditStaffPage = () => {
  // Renamed component
  const router = useRouter(); // Get router
  const { id } = router.query; // Get staff ID from URL

  const [isLoading, setIsLoading] = useState(true); // Set initial loading state to true
  const [activeTab, setActiveTab] = useState("personal-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    certificateURL: "", // Added for existing file URL
    experience: "",

    // Shift Selection
    preferredShifts: [] as string[],

    // Skills
    languages: [] as string[],
    services: [] as string[],

    // Additional Info
    foodPreference: "",
    smoking: "",
    carryFood: "",
    additionalInfo: "",

    // Testimonial
    customerName: "",
    customerPhone: "",
    recording: null as File | null,
    recordingURL: "", // Added for existing file URL

    // ID Proof
    aadharNumber: "",
    aadharFront: null as File | null,
    aadharFrontURL: "", // Added for existing file URL
    aadharBack: null as File | null,
    aadharBackURL: "", // Added for existing file URL
    panNumber: "",
    panCard: null as File | null,
    panCardURL: "", // Added for existing file URL

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
  });

  // Date range state for react-date-range
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: undefined, // Use undefined instead of null
      key: "selection",
    },
  ]);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch staff data on component mount and when ID changes
  useEffect(() => {
    const fetchStaff = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const result = await getStaffDetails(id as string);

          if (result?.success && result?.data) {
            const staffData = result.data as any; // Cast to any to bypass TS error for now
            console.log(
              "Fetched staffData.availability:",
              staffData.availability
            ); // Add this line
            // Populate form data with fetched data
            setFormData({
              // Map Firestore data fields to form state fields
              fullName: staffData.name || "",
              gender: staffData.gender || "",
              maritalStatus: staffData.maritalStatus || "",
              jobRole: staffData.jobRole || "",
              dateOfBirth: staffData.dateOfBirth || "", // New field
              religion: staffData.religion || "", // New field

              // Profile Photo
              profilePhoto: null, // File input is reset
              profilePhotoURL: staffData.profilePhoto || "", // Use URL from fetched data

              // Wages
              lessThan5Hours:
                staffData.expectedWages?.["5hrs"]?.toString() || "",
              hours12: staffData.expectedWages?.["12hrs"]?.toString() || "",
              hours24: staffData.expectedWages?.["24hrs"]?.toString() || "",

              // Education
              qualification: staffData.educationQualification || "",
              certificate: null, // File input is reset
              certificateURL: staffData.educationCertificate || "", // Use URL from fetched data
              experience: staffData.experienceYears || "",

              // Shift Selection
              preferredShifts: staffData.preferredShifts || [],

              // Skills
              languages: staffData.languagesKnown || [],
              services: staffData.extraServicesOffered || [],

              // Additional Info
              foodPreference: staffData.foodPreference || "",
              smoking: staffData.smokes || "",
              carryFood: staffData.carryOwnFood12hrs || "",
              additionalInfo: staffData.additionalInfo || "",

              // Testimonial
              customerName: staffData.selfTestimonial?.customerName || "",
              customerPhone: staffData.selfTestimonial?.customerPhone || "",
              recording: null, // File input is reset
              recordingURL: staffData.selfTestimonial?.recording || "", // Use URL from fetched data

              // ID Proof
              aadharNumber: staffData.identityDocuments?.aadharNumber || "",
              aadharFront: null, // File input is reset
              aadharFrontURL: staffData.identityDocuments?.aadharFront || "", // Use URL from fetched data
              aadharBack: null, // File input is reset
              aadharBackURL: staffData.identityDocuments?.aadharBack || "", // Use URL from fetched data
              panNumber: staffData.identityDocuments?.panNumber || "",
              panCard: null, // File input is reset
              panCardURL: staffData.identityDocuments?.panDocument || "", // Use URL from fetched data

              // New fields
              currentAddress: staffData.currentAddress || {
                street: "",
                city: "",
                state: "",
                zip: "",
              }, // New field
              permanentAddress: staffData.permanentAddress || {
                street: "",
                city: "",
                state: "",
                zip: "",
              }, // New field
              isCurrentAddressSameAsPermanent:
                staffData.isCurrentAddressSameAsPermanent || false, // New field
              isActive: staffData.isActive || false, // New field with default
              aadharVerified: staffData.aadharVerified || false, // New field with default
              policeVerified: staffData.policeVerified || false, // New field with default
              bankDetails: staffData.bankDetails || {
                accountName: "",
                accountNumber: "",
                ifscCode: "",
                bankName: "",
                bankBranch: "",
              }, // New field
              availability:
                staffData.availability ||
                ([] as { startDate: string; endDate: string }[]), // New field
            });

            // Convert fetched availability to dateRange format
            if (staffData.availability && staffData.availability.length > 0) {
              const initialDateRange: Range[] = staffData.availability.map(
                (range: { startDate: string; endDate: string }) => {
                  const [startDay, startMonth, startYear] = range.startDate
                    .split("/")
                    .map(Number);
                  const [endDay, endMonth, endYear] = range.endDate
                    .split("/")
                    .map(Number);

                  return {
                    startDate: new Date(startYear, startMonth - 1, startDay), // Month is 0-indexed
                    endDate: new Date(endYear, endMonth - 1, endDay), // Month is 0-indexed
                    key: "selection",
                  };
                }
              );
              setDateRange(initialDateRange);
            } else {
              // Initialize with a default range if no availability data
              setDateRange([
                {
                  startDate: new Date(),
                  endDate: undefined,
                  key: "selection",
                },
              ]);
            }

            if (staffData.selfTestimonial?.recording) {
              setAudioURL(staffData.selfTestimonial.recording);
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch staff data.",
              variant: "destructive",
            });
            // Optionally redirect or show an error message
          }
        } catch (error) {
          console.error("Error fetching staff data:", error);
          toast({
            title: "Error",
            description: "An error occurred while fetching staff data.",
            variant: "destructive",
          });
          // Optionally redirect or show an error message
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStaff();
  }, [id]); // Rerun effect when ID changes

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    name: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const currentValues = prev[name as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter((v) => v !== value) };
      }
    });
  };

  // Handle file uploads
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    // Clear existing URL when a new file is selected
    if (file) {
      setFormData((prev) => ({ ...prev, [`${fieldName}URL`]: "" }));
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        // Convert Blob to File
        const audioFile = new File([audioBlob], "testimonial.mp3", {
          type: "audio/mp3",
        });
        setFormData((prev) => ({ ...prev, recording: audioFile }));
        // Clear existing URL when a new recording is made
        setFormData((prev) => ({ ...prev, recordingURL: "" }));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const dayContentRenderer = (date: Date) => {
    const isUnavailable = formData.availability.some((range) => {
      const [startDay, startMonth, startYear] = range.startDate
        .split("/")
        .map(Number);
      const [endDay, endMonth, endYear] = range.endDate.split("/").map(Number);

      const startDate = new Date(startYear, startMonth - 1, startDay); // Month is 0-indexed
      const endDate = new Date(endYear, endMonth - 1, endDay); // Month is 0-indexed

      // Check if the date is within the unavailable range (inclusive of start and end dates)
      return isWithinInterval(date, { start: startDate, end: endDate });
    });

    if (isUnavailable) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <span className="absolute top-0 right-0 mt-1 mr-1 block h-2 w-2 rounded-full bg-red-500"></span>
        </div>
      );
    }

    return null; // Render default content
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast({
        title: "Error",
        description: "Staff ID is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      setIsSubmitting(true);

      // Handle file uploads and get URLs
      let certificateURL = formData.certificateURL;
      let aadharFrontURL = formData.aadharFrontURL;
      let aadharBackURL = formData.aadharBackURL;
      let panCardURL = formData.panCardURL;
      let recordingURL = formData.recordingURL;

      if (formData.certificate) {
        certificateURL = await uploadFile(
          formData.certificate,
          `users/${id}/certificates/${formData.certificate.name}`
        );
      }

      if (formData.aadharFront) {
        aadharFrontURL = await uploadFile(
          formData.aadharFront,
          `users/${id}/documents/aadhar_front_${formData.aadharFront.name}`
        );
      }

      if (formData.aadharBack) {
        aadharBackURL = await uploadFile(
          formData.aadharBack,
          `users/${id}/documents/aadhar_back_${formData.aadharBack.name}`
        );
      }

      if (formData.panCard) {
        panCardURL = await uploadFile(
          formData.panCard,
          `users/${id}/documents/pan_${formData.panCard.name}`
        );
      }

      if (formData.recording) {
        recordingURL = await uploadFile(
          formData.recording,
          `users/${id}/testimonials/${formData.recording.name}`
        );
      }

      // Prepare data for saving (map form state back to Firestore structure)
      const dataToSave = {
        name: formData.fullName,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        jobRole: formData.jobRole,
        dateOfBirth: formData.dateOfBirth, // New field
        religion: formData.religion, // New field
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
        educationQualification: formData.qualification,
        educationCertificate: certificateURL,
        experienceYears: formData.experience,
        preferredShifts: formData.preferredShifts,
        languagesKnown: formData.languages,
        extraServicesOffered: formData.services,
        foodPreference: formData.foodPreference,
        smokes: formData.smoking,
        carryOwnFood12hrs: formData.carryFood,
        additionalInfo: formData.additionalInfo,
        selfTestimonial: {
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          recording: recordingURL,
        },
        identityDocuments: {
          aadharNumber: formData.aadharNumber,
          aadharFront: aadharFrontURL,
          aadharBack: aadharBackURL,
          panNumber: formData.panNumber,
          panDocument: panCardURL,
        },
        // createdAt and updatedAt would typically be handled server-side or with Firestore Timestamps
        // For this example, we'll omit them from the update data
      };

      // Convert dateRange state to formData.availability format
      const updatedAvailability: { startDate: string; endDate: string }[] =
        dateRange.map((range) => ({
          startDate: range.startDate
            ? format(range.startDate, "dd/MM/yyyy")
            : "",
          endDate: range.endDate ? format(range.endDate, "dd/MM/yyyy") : "",
        }));

      dataToSave.availability = updatedAvailability;

      console.log("Data to save:", dataToSave);
      const staffDocRef = doc(db, "users", id as string);
      await updateDoc(staffDocRef, dataToSave);

      // Simulate success for now
      const result = { success: true }; // Keep this for now until actual error handling is implemented

      if (result.success) {
        // This check will need to be updated based on actual updateDoc result handling
        setIsSuccess(true);
        toast({
          title: "Update Successful",
          description: "Staff member details have been updated successfully",
        });
      } else {
        toast({
          title: "Update Failed",
          description:
            "Failed to update staff member details. Please try again.",
          variant: "destructive",
        });
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
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4 text-center">
          Loading staff data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Staff Details</h1>{" "}
        {/* Updated title */}
        {isSuccess ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Update Successful
                </h2>{" "}
                {/* Updated success message */}
                <p className="text-muted-foreground text-center mb-6">
                  The staff member details have been successfully updated in the
                  system.
                </p>
                <Button
                  onClick={() => {
                    // Optionally redirect to staff list or profile page
                    router.push("/staff"); // Example: Redirect to staff list
                  }}
                >
                  Back to Staff List {/* Updated button text */}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Staff Details</CardTitle> {/* Updated title */}
                <CardDescription>
                  Edit the details of the staff member
                </CardDescription>{" "}
                {/* Updated description */}
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-6 mb-6">
                    <TabsTrigger value="personal-info">
                      Personal Info
                    </TabsTrigger>
                    <TabsTrigger value="other-details">
                      Other Details
                    </TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal-info" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Personal Information
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Profile Photo Display and Input */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="profilePhoto">Profile Photo</Label>
                          <div className="flex items-center gap-4">
                            {formData.profilePhotoURL && (
                              <img
                                src={formData.profilePhotoURL}
                                alt="Profile"
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
                              />
                              {formData.profilePhoto && (
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
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
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) =>
                              handleSelectChange("gender", value)
                            }
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

                        <div className="space-y-2">
                          <Label htmlFor="maritalStatus">Marital Status</Label>
                          <Select
                            value={formData.maritalStatus}
                            onValueChange={(value) =>
                              handleSelectChange("maritalStatus", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="jobRole">Job Role</Label>
                          <Select
                            value={formData.jobRole}
                            onValueChange={(value) =>
                              handleSelectChange("jobRole", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select job role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nurse">Nurse</SelectItem>
                              <SelectItem value="caregiver">
                                Caregiver
                              </SelectItem>
                              <SelectItem value="physiotherapist">
                                Physiotherapist
                              </SelectItem>
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
                      <h3 className="text-lg font-medium">Wages Information</h3>

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
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Religion */}
                        <div className="space-y-2">
                          <Label htmlFor="religion">Religion</Label>
                          <Select
                            value={formData.religion}
                            onValueChange={(value) =>
                              handleSelectChange("religion", value)
                            }
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
                              <SelectItem value="buddhist">Buddhist</SelectItem>
                              <SelectItem value="jain">Jain</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Current Address */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium">Current Address</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="currentAddress.street">
                              Street
                            </Label>
                            <Input
                              id="currentAddress.street"
                              name="currentAddress.street"
                              placeholder="Street Address"
                              value={formData.currentAddress.street}
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
                            <Label htmlFor="currentAddress.city">City</Label>
                            <Input
                              id="currentAddress.city"
                              name="currentAddress.city"
                              placeholder="City"
                              value={formData.currentAddress.city}
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
                            <Label htmlFor="currentAddress.state">State</Label>
                            <Input
                              id="currentAddress.state"
                              name="currentAddress.state"
                              placeholder="State"
                              value={formData.currentAddress.state}
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
                            <Label htmlFor="currentAddress.zip">Zip Code</Label>
                            <Input
                              id="currentAddress.zip"
                              name="currentAddress.zip"
                              placeholder="Zip Code"
                              value={formData.currentAddress.zip}
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
                                  Street
                                </Label>
                                <Input
                                  id="permanentAddress.street"
                                  name="permanentAddress.street"
                                  placeholder="Street Address"
                                  value={formData.permanentAddress.street}
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
                                  City
                                </Label>
                                <Input
                                  id="permanentAddress.city"
                                  name="permanentAddress.city"
                                  placeholder="City"
                                  value={formData.permanentAddress.city}
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
                                  State
                                </Label>
                                <Input
                                  id="permanentAddress.state"
                                  name="permanentAddress.state"
                                  placeholder="State"
                                  value={formData.permanentAddress.state}
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
                                  Zip Code
                                </Label>
                                <Input
                                  id="permanentAddress.zip"
                                  name="permanentAddress.zip"
                                  placeholder="Zip Code"
                                  value={formData.permanentAddress.zip}
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
                        <Label htmlFor="availability">Availability</Label>
                        <DateRange
                          ranges={dateRange}
                          onChange={(item) =>
                            setDateRange([
                              ...dateRange,
                              item.selection as Range,
                            ])
                          }
                          moveRangeOnFirstSelection={false}
                          months={2}
                          direction="horizontal"
                          dayContentRenderer={dayContentRenderer} // Add this prop
                        />
                        <p className="text-sm text-muted-foreground">
                          Select date ranges when the staff member is
                          unavailable.
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
                          <Label htmlFor="qualification">Qualification</Label>
                          <Select
                            value={formData.qualification}
                            onValueChange={(value) =>
                              handleSelectChange("qualification", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select qualification" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10th">10th Pass</SelectItem>
                              <SelectItem value="12th">12th Pass</SelectItem>
                              <SelectItem value="diploma">Diploma</SelectItem>
                              <SelectItem value="graduate">Graduate</SelectItem>
                              <SelectItem value="postgraduate">
                                Post Graduate
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience (years)</Label>
                          <Input
                            id="experience"
                            name="experience"
                            type="number"
                            placeholder="Years of experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="certificate">
                            Education Certificate
                          </Label>
                          <div className="flex items-center gap-2">
                            {/* Certificate Input */}
                            <Input
                              id="certificate"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                handleFileChange(e, "certificate")
                              }
                              className="flex-1"
                            />
                            {formData.certificateURL && (
                              <a
                                href={formData.certificateURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Existing
                              </a>
                            )}
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
                      <h3 className="text-lg font-medium">Shift Preferences</h3>

                      <div className="space-y-3">
                        <Label>Preferred Shifts</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            "Morning",
                            "Afternoon",
                            "Evening",
                            "Night",
                            "12 Hours",
                            "24 Hours",
                          ].map((shift) => (
                            <div
                              key={shift}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`shift-${shift}`}
                                checked={formData.preferredShifts.includes(
                                  shift.toLowerCase()
                                )}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(
                                    "preferredShifts",
                                    shift.toLowerCase(),
                                    checked as boolean
                                  )
                                }
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

                      <div className="space-y-3">
                        <Label>Additional Services</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            "Cooking",
                            "Cleaning",
                            "Bathing",
                            "Medication",
                            "Vital Monitoring",
                            "Wound Care",
                            "Mobility Assistance",
                          ].map((service) => (
                            <div
                              key={service}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`service-${service}`}
                                checked={formData.services.includes(
                                  service.toLowerCase()
                                )}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(
                                    "services",
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
                            Food Preference
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
                              <SelectItem value="vegetarian">
                                Vegetarian
                              </SelectItem>
                              <SelectItem value="non-vegetarian">
                                Non-Vegetarian
                              </SelectItem>
                              <SelectItem value="eggetarian">
                                Eggetarian
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smoking">Smoking Habit</Label>
                          <RadioGroup
                            value={formData.smoking}
                            onValueChange={(value) =>
                              handleSelectChange("smoking", value)
                            }
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

                        <div className="space-y-2">
                          <Label htmlFor="carryFood">
                            Can carry own food for 12hr shift?
                          </Label>
                          <RadioGroup
                            value={formData.carryFood}
                            onValueChange={(value) =>
                              handleSelectChange("carryFood", value)
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="carryFood-yes" />
                              <Label
                                htmlFor="carryFood-yes"
                                className="font-normal"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="carryFood-no" />
                              <Label
                                htmlFor="carryFood-no"
                                className="font-normal"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
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

                    <div className="space-y-4">
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
                          <Label htmlFor="customerPhone">Customer Phone</Label>
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
                        <Label>Voice Testimonial</Label>
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-2">
                            {!isRecording ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={startRecording}
                                disabled={!!audioURL && !formData.recording} // Disable if existing URL and no new recording
                              >
                                <Mic className="h-4 w-4 mr-2" />
                                Start Recording
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={stopRecording}
                                className="bg-red-100 hover:bg-red-200 text-red-600"
                              >
                                <StopCircle className="h-4 w-4 mr-2" />
                                Stop Recording
                              </Button>
                            )}

                            {(audioURL || formData.recordingURL) && ( // Show clear button if either URL exists
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setAudioURL(null);
                                  setFormData((prev) => ({
                                    ...prev,
                                    recording: null,
                                    recordingURL: "", // Clear both file and URL
                                  }));
                                }}
                              >
                                Clear
                              </Button>
                            )}
                          </div>

                          {(audioURL || formData.recordingURL) && ( // Show audio player if either URL exists
                            <div className="border rounded-md p-3 bg-muted">
                              <audio
                                src={audioURL || formData.recordingURL} // Use new URL if recording, otherwise existing
                                controls
                                className="w-full"
                              />
                            </div>
                          )}

                          {isRecording && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Recording in progress</AlertTitle>
                              <AlertDescription>
                                Please speak clearly into your microphone.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
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
                          <Label htmlFor="aadharNumber">Aadhar Number</Label>
                          <Input
                            id="aadharNumber"
                            name="aadharNumber"
                            placeholder="Enter 12-digit Aadhar number"
                            value={formData.aadharNumber}
                            onChange={handleInputChange}
                            maxLength={12}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="aadharFront">Aadhar Front</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="aadharFront"
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) =>
                                  handleFileChange(e, "aadharFront")
                                }
                                className="flex-1"
                              />
                              {formData.aadharFrontURL && (
                                <a
                                  href={formData.aadharFrontURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  View Existing
                                </a>
                              )}
                              {formData.aadharFront && (
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="aadharBack">Aadhar Back</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="aadharBack"
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) =>
                                  handleFileChange(e, "aadharBack")
                                }
                                className="flex-1"
                              />
                              {formData.aadharBackURL && (
                                <a
                                  href={formData.aadharBackURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  View Existing
                                </a>
                              )}
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
                            {formData.panCardURL && (
                              <a
                                href={formData.panCardURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Existing
                              </a>
                            )}
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
                      "professional",
                      "preferences",
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

                {activeTab !== "documents" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const tabs = [
                        "personal-info",
                        "professional",
                        "preferences",
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
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Staff"}{" "}
                    {/* Updated button text */}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default EditStaffPage;

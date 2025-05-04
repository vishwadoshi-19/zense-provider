"use client";
import Layout from "@/components/common/Layout";

import type React from "react";

import { useState, useRef } from "react";
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

import {
  saveFormData,
  uploadFile,
  updateDoc,
  doc,
  db,
} from "@/lib/firebase/firestore";
import { set } from "date-fns";

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
    services: [] as string[],

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
  });

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
            result.message || "An error occurred during user creation.",
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
          "An error occurred while creating the user. Please try again.",
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
        console.log("Profile photo uploaded:", profilePhotoURL);
      }

      if (formData.certificate) {
        console.log("Uploading certificate...");
        certificateURL = await uploadFile(
          formData.certificate,
          `users/${userId}/certificates/${formData.certificate.name}`
        );
        setFormData((prev) => ({ ...prev, certificateURL })); // Store the uploaded file URL in the new field
        console.log("Certificate uploaded:", certificateURL);
      }

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
        // Changed from recording
        console.log("Uploading video...");
        videoURL = await uploadFile(
          // Changed from recordingURL
          formData.video, // Changed from recording
          `users/${userId}/testimonials/${formData.video.name}` // Changed path
        );
        console.log("Video uploaded:", videoURL); // Changed log
      }

      // Prepare data for saving
      const dataToSave = {
        // Map formData to the structure expected by saveFormData in firestore.ts
        name: formData.fullName || "",
        gender: formData.gender || "",
        maritalStatus: formData.maritalStatus || "",
        jobRole: formData.jobRole || "",
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
        extraServicesOffered: formData.services || [],
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
        identityDocuments: {
          aadharNumber: formData.aadharNumber || "",
          aadharFront: aadharFrontURL || "", // Pass URL after upload
          aadharBack: aadharBackURL || "", // Pass URL after upload
          panNumber: formData.panNumber || "",
          panDocument: panCardURL || "", // Use panDocument for consistency
        },
        phone: phoneNumber ? `+91${phoneNumber}` : "", // Add phone number from state
        status: "registered", // Set initial status
        providerId: "zense", // Assuming a default providerId
        profilePhoto: profilePhotoURL || "", // Include profile photo URL
        // Note: agency, location, district, subDistricts are not included as they are not in the current form state.
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
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Provider Staff Registration</h1>

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
                <Button
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
                      services: [],
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
                    });
                  }}
                >
                  Register Another Staff
                </Button>
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
                      <TabsList className="grid grid-cols-4 mb-6">
                        <TabsTrigger value="personal-info">
                          Personal Info
                        </TabsTrigger>
                        <TabsTrigger value="professional">
                          Professional
                        </TabsTrigger>
                        <TabsTrigger value="preferences">
                          Preferences
                        </TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal-info" className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Personal Information
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2">
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

                            {/* Profile Photo Input */}
                            <div className="space-y-2">
                              <Label htmlFor="profilePhoto">
                                Profile Photo
                              </Label>
                              <div className="flex items-center gap-2">
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
                              <Label htmlFor="maritalStatus">
                                Marital Status
                              </Label>
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

                      <TabsContent value="professional" className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Education & Experience
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="qualification">
                                Qualification
                              </Label>
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
                                  <SelectItem value="postgraduate">
                                    Post Graduate
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="experience">
                                Experience (years)
                              </Label>
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
                                <Input
                                  id="certificate"
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileChange(e, "certificate")
                                  }
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
                            Shift Preferences
                          </h3>

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
                                  <RadioGroupItem
                                    value="yes"
                                    id="carryFood-yes"
                                  />
                                  <Label
                                    htmlFor="carryFood-yes"
                                    className="font-normal"
                                  >
                                    Yes
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="no"
                                    id="carryFood-no"
                                  />
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
                                Aadhar Number
                              </Label>
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
                                <Label htmlFor="aadharFront">
                                  Aadhar Front
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

                    {activeTab !== "documents" && (
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
                    )}

                    {activeTab === "documents" && (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Register Staff"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </form>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AddStaffPage;

// {/* <div>
//   <h1 className="text-3xl font-bold">Add New Staff</h1>
//   {/* Add your form for adding staff here */}
//   <p>Form to add new staff will go here.</p>
// </div> */}

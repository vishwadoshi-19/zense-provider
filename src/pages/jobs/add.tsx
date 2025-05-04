import React, { useState } from "react";
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
import { Job } from "@/types";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";

interface FormData {
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  serviceType?: string;
  shiftType?: string;
  address?: string;
  startDate?: string; // Store as string initially from date input
  notes?: string;
}

const AddJobPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.uid) {
      console.error("User not logged in");
      return;
    }

    setLoading(true);
    try {
      const newJob: Partial<Job> = {
        providerId: user.uid,
        customerName: formData.patientName,
        customerAge:
          formData.patientAge !== undefined
            ? Number(formData.patientAge)
            : undefined,
        customerGender: formData.patientGender as
          | "Male"
          | "Female"
          | "Other"
          | undefined,
        serviceType: formData.serviceType as
          | "Nurse"
          | "Semi-Nurse"
          | "Attendant"
          | undefined,
        JobType: formData.shiftType as
          | "6 Hour"
          | "12 Hour"
          | "24 Hour"
          | undefined,
        address: formData.address,
        startDate:
          formData.startDate !== undefined
            ? new Date(formData.startDate)
            : undefined,
        notes: formData.notes,
        status: "Pending", // Default status for new jobs
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<Job>; // Type assertion on the object literal
      await addDoc(collection(db, "jobs"), newJob);
      router.push("/jobs");
    } catch (error) {
      console.error("Error adding job:", error);
      setLoading(false);
    }
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
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              name="patientName"
              value={formData.patientName ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="patientAge">Patient Age</Label>
            <Input
              id="patientAge"
              name="patientAge"
              type="number"
              value={formData.patientAge ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="patientGender">Patient Gender</Label>
            <Select
              onValueChange={(value) =>
                handleSelectChange("patientGender", value)
              }
              value={formData.patientGender ?? ""}
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
            <Label htmlFor="serviceType">Service Type</Label>
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
                <SelectItem value="Nurse">Nurse</SelectItem>
                <SelectItem value="Semi-Nurse">Semi-Nurse</SelectItem>
                <SelectItem value="Attendant">Attendant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shiftType">Shift Type</Label>
            <Select
              onValueChange={(value) => handleSelectChange("shiftType", value)}
              value={formData.shiftType ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Shift Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6 Hour">6 Hour</SelectItem>
                <SelectItem value="12 Hour">12 Hour</SelectItem>
                <SelectItem value="24 Hour">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate ?? ""}
              onChange={handleChange}
              required
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

          <Button type="submit" disabled={loading}>
            {loading ? "Adding Job..." : "Add Job"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default AddJobPage;

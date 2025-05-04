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
import { Job } from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/components/auth/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface FormData {
  customerName?: string;
  customerAge?: number;
  customerGender?: string;
  serviceType?: string;
  JobType?: string;
  address?: string;
  startDate?: string; // Store as string initially from date input
  endDate?: string; // Store as string initially from date input
  notes?: string;
  status?: string;
  staffId?: string | null;
  description?: string;
  requirements?: string; // Representing as a single string for simplicity in form
  district?: string;
  subDistrict?: string;
}

const EditJobPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id || !user) return;

      try {
        const jobDocRef = doc(db, "jobs", id as string);
        const jobDocSnap = await getDoc(jobDocRef);

        if (jobDocSnap.exists()) {
          const jobData = jobDocSnap.data() as any; // Temporarily cast to any
          setJob(jobData as Job); // Cast back to Job for state
          setFormData({
            customerName: jobData.customerName ?? undefined,
            customerAge: jobData.customerAge ?? undefined,
            customerGender: jobData.customerGender ?? undefined,
            serviceType: jobData.serviceType ?? undefined,
            JobType: jobData.JobType ?? undefined,
            address: jobData.address ?? undefined,
            startDate: jobData.startDate // .toISOString().split("T")[0]
              ? jobData?.startDate
              : undefined,
            endDate: jobData.endDate ? jobData?.endDate : undefined,
            notes: jobData.notes ?? undefined,
            status: jobData.status ?? undefined,
            staffId: jobData.staffId ?? undefined,
            description: jobData.description ?? undefined,
            requirements: jobData.requirements
              ? jobData.requirements.join(", ")
              : undefined, // Join array for form
            district: jobData.district ?? undefined,
            subDistrict: jobData.subDistrict ?? undefined,
          });
        } else {
          console.error("No such job document!");
          router.push("/jobs"); // Redirect if job not found
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        router.push("/jobs"); // Redirect on error
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user, router]);

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
    if (!user || !user.uid || !id) {
      console.error("User not logged in or job ID is missing");
      return;
    }

    setLoading(true);
    try {
      const updatedJobData: Partial<Job> = {
        customerName: formData.customerName,
        customerAge:
          formData.customerAge !== undefined
            ? Number(formData.customerAge)
            : undefined,
        customerGender: formData.customerGender as
          | "Male"
          | "Female"
          | "Other"
          | undefined,
        serviceType: formData.serviceType as
          | "Attendant"
          | "Nurse"
          | "Semi-Nurse"
          | undefined,
        JobType: formData.JobType as
          | "6 Hour"
          | "12 Hour"
          | "24 Hour"
          | undefined,
        address: formData.address,
        startDate:
          formData.startDate !== undefined
            ? new Date(formData.startDate)
            : undefined,
        endDate:
          formData.endDate !== undefined ? new Date(formData.endDate) : null,
        notes: formData.notes,
        status: formData.status as
          | "Pending"
          | "assigned"
          | "completed"
          | "ongoing"
          | undefined,
        staffId: formData.staffId,
        description: formData.description,
        requirements: formData.requirements
          ? formData.requirements.split(",").map((req) => req.trim())
          : [], // Split string back to array
        district: formData.district,
        subDistrict: formData.subDistrict,
        updatedAt: new Date(),
      };

      const jobDocRef = doc(db, "jobs", id as string);
      await updateDoc(jobDocRef, updatedJobData);
      router.push("/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return <div>Job not found.</div>; // Or handle the case where job is null after loading
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Job</h1>
          <p className="text-gray-500 mt-1">
            Edit the details of the job request
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="customerAge">Customer Age</Label>
            <Input
              id="customerAge"
              name="customerAge"
              type="number"
              value={formData.customerAge ?? ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="customerGender">Customer Gender</Label>
            <Select
              onValueChange={(value) =>
                handleSelectChange("customerGender", value)
              }
              value={formData.customerGender ?? ""}
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
                <SelectItem value="Attendant">Attendant</SelectItem>
                <SelectItem value="Nurse">Nurse</SelectItem>
                <SelectItem value="Semi-Nurse">Semi-Nurse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="JobType">Job Type</Label>
            <Select
              onValueChange={(value) => handleSelectChange("JobType", value)}
              value={formData.JobType ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Job Type" />
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
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate ?? ""}
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
            <Label htmlFor="requirements">Requirements (comma-separated)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              name="district"
              value={formData.district ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="subDistrict">Sub-District</Label>
            <Input
              id="subDistrict"
              name="subDistrict"
              value={formData.subDistrict ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(value) => handleSelectChange("status", value)}
              value={formData.status ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="staffId">Assigned Staff ID</Label>
            <Input
              id="staffId"
              name="staffId"
              value={formData.staffId ?? ""}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating Job..." : "Update Job"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default EditJobPage;

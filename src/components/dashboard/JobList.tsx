import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Job, Staff } from "@/types";
import {
  Plus,
  Search,
  Edit,
  Trash,
  UserPlus,
  X,
  UserRoundCheck,
} from "lucide-react";
import { format } from "date-fns";
import AssignStaffDialog from "./AssignStaffDialog";
import { useRouter } from "next/router";
import { Job2 } from "@/types/jobs";

interface JobListProps {
  jobList: Job2[];
  staffList: Staff[]; // Assuming staffList is passed as a prop
  onAddJob: () => void;
  onEditJob: (job: Job2) => void;
  onDeleteJob: (jobId: string) => void;
  onStaffAssigned: (staffId: string, jobId: string) => Promise<void>; // Renamed and updated type
}

const JobList = ({
  jobList,
  staffList, // Assuming staffList is passed as a prop
  onAddJob,
  onEditJob,
  onDeleteJob,
  onStaffAssigned, // Renamed and updated type
}: JobListProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterService, setFilterService] = useState<string>("All");
  const [filterShift, setFilterShift] = useState<string>("All");
  const [filterAssigned, setFilterAssigned] = useState<string>("All");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [jobToAssign, setJobToAssign] = useState<Job2 | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAssignStaffClick = (job: Job2) => {
    setJobToAssign(job);
    setIsAssignDialogOpen(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleStaffAssignment = async (staffId: string, jobId: string) => {
    // Made async
    await onStaffAssigned(staffId, jobId); // Call the updated prop and await it
    jobToAssign!.staffInfo = { staffId };
    setIsAssignDialogOpen(false);
    setJobToAssign(null);
  };

  const filteredJobs = jobList.filter((job) => {
    console.log("Job ID:", job.id, job);
    const matchesSearch =
      job?.patientInfo?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false ||
      job.id.includes(searchTerm);
    const matchesStatus = filterStatus === "All" || job.status === filterStatus;
    const matchesService =
      filterService === "All" || job.jobType === filterService;
    const matchesShift =
      filterShift === "All" || job.serviceType === filterShift;
    const matchesAssigned =
      filterAssigned === "All" ||
      (filterAssigned === "Assigned" && job?.staffInfo?.staffId) ||
      (filterAssigned === "Not Assigned" && !job?.staffInfo?.staffId);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesService &&
      matchesShift &&
      matchesAssigned
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned": // Changed from "Assigned" to "assigned"
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "conpleted":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isStaffViewDialogOpen, setIsStaffViewDialogOpen] = useState(false);

  function onViewAssignedStaff(job: Job2): void {
    if (job?.staffInfo?.staffId) {
      router.push(`/staff/${job.staffInfo.staffId}`);
      // Find the staff member from staffList using the staffId
      const staffMember = staffList.find(
        (staff) => staff.id === job.staffInfo?.staffId
      );

      if (staffMember) {
        setSelectedStaff(staffMember);
        setIsStaffViewDialogOpen(true);
      } else {
        // Handle case where staff ID exists but staff not found
        console.error(`Staff with ID ${job.staffInfo.staffId} not found`);
        // Could show a toast notification here
      }
    }
  }

  // const startDate = job?.startDate?.toDate
  //   ? format(job.startDate.toDate(), "yyyy-MM-dd")
  //   : "";
  // currentJobs.forEach((job) => {
  //   console.log("Job ID:", job.id, job);
  // });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search jobs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            setSearchTerm("");
            setFilterStatus("All");
            setFilterService("All");
            setFilterShift("All");
            setFilterAssigned("All");
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto "
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>{" "}
            {/* Changed value to "assigned" */}
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
          >
            <option value="All">All Services</option>
            <option value="attendant">Attendant</option>
            <option value="nurse">Nurse</option>
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
          >
            <option value="All">All Shifts</option>
            <option value="6 hour">6 Hours</option>
            <option value="12 hour">12 Hours</option>
            <option value="24 hour">24 Hours</option>
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filterAssigned}
            onChange={(e) => setFilterAssigned(e.target.value)}
          >
            <option value="All">All Assignments</option>
            <option value="Assigned">Assigned</option>
            <option value="Not Assigned">Not Assigned</option>
          </select>

          <Button onClick={onAddJob} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Patient
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Shift
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  PIN
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Staff
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {job.patientInfo?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job?.patientInfo?.age} yrs,{" "}
                        {job?.patientInfo?.gender || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {job?.jobType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {job?.serviceType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {job?.startDate
                          ? typeof job.startDate === "object" &&
                            "toDate" in job.startDate &&
                            typeof job.startDate.toDate === "function"
                            ? format(job.startDate.toDate(), "dd/MM/yyyy")
                            : typeof job.startDate === "string"
                            ? job.startDate
                            : format(job.startDate, "dd/MM/yyyy")
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.pin || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignStaffClick(job)}
                          className="text-xs"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                        {job?.staffInfo?.staffId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewAssignedStaff(job)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <UserRoundCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditJob(job)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteJob(job.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-2">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span className="self-center text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>

      <AssignStaffDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        staffList={staffList}
        jobToAssign={jobToAssign}
        onAssign={handleStaffAssignment}
      />
    </div>
  );
};

export default JobList;

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Job, Staff } from "@/types";
import { Plus, Search, Edit, Trash, UserPlus } from "lucide-react";
import { format } from "date-fns";
import AssignStaffDialog from "./AssignStaffDialog";
import { useRouter } from "next/router";

interface JobListProps {
  jobList: Job[];
  staffList: Staff[]; // Assuming staffList is passed as a prop
  onAddJob: () => void;
  onEditJob: (job: Job) => void;
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
  const [jobToAssign, setJobToAssign] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAssignStaffClick = (job: Job) => {
    setJobToAssign(job);
    setIsAssignDialogOpen(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleStaffAssignment = async (staffId: string, jobId: string) => {
    // Made async
    await onStaffAssigned(staffId, jobId); // Call the updated prop and await it
    setIsAssignDialogOpen(false);
    setJobToAssign(null);
  };

  const filteredJobs = jobList.filter((job) => {
    const matchesSearch =
      job?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.includes(searchTerm);
    const matchesStatus = filterStatus === "All" || job.status === filterStatus;
    const matchesService =
      filterService === "All" || job.serviceType === filterService;
    const matchesShift = filterShift === "All" || job.JobType === filterShift;
    const matchesAssigned =
      filterAssigned === "All" ||
      (filterAssigned === "Assigned" && job.staffId) ||
      (filterAssigned === "Not Assigned" && !job.staffId);

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
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned": // Changed from "Assigned" to "assigned"
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="assigned">Assigned</option>{" "}
            {/* Changed value to "assigned" */}
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
            <option value="6hour">6 Hours</option>
            <option value="12hour">12 Hours</option>
            <option value="24hour">24 Hours</option>
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
                        {job.customerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.customerAge} yrs, {job.customerGender || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {job.serviceType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.JobType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {job.startDate
                          ? job.startDate &&
                            !isNaN(new Date(job.startDate).getTime())
                            ? format(new Date(job.startDate), "MM dd, yyyy")
                            : "Invalid Date"
                          : "N/A"}
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
                      {job.staffId ? (
                        <div className="text-sm text-gray-500">Assigned</div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignStaffClick(job)}
                          className="text-xs"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      )}
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

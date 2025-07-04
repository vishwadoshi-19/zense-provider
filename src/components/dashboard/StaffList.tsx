import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Staff } from "@/types";
import { Plus, Search, Edit, Trash, X, Copy, ArrowDownToLine } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { toast } from "@/hooks/use-toast";
import { generateStaffPDFReport } from "@/lib/downloadPDF";
import { getGroupedDutiesByRole } from "@/constants/duties";

console.log("StaffList component loaded");

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

interface StaffListProps {
  staffList: any[];
  onAddStaff: () => void;
  onEditStaff: (staff: Staff) => void;
  onDeleteStaff: (staffId: string) => void;
  onViewStaff: (staffId: string) => void;
  batchMode?: boolean;
  selectedStaffIds?: string[];
  onSelectStaff?: (id: string) => void;
}

const StaffList = ({
  staffList,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onViewStaff,
  batchMode = false,
  selectedStaffIds = [],
  onSelectStaff = () => {},
}: StaffListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterAvailability, setFilterAvailability] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingStates, setDownloadingStates] = useState<{ [key: string]: boolean }>({});
  const itemsPerPage = 10;

  // PDF download handler for individual staff
  const handleDownloadPDF = async (staff: any) => {
    const staffId = staff.id;
    setDownloadingStates(prev => ({ ...prev, [staffId]: true }));
    
    try {
      const groupedDuties = staff?.jobRole ? getGroupedDutiesByRole(staff.jobRole) : {};
      // For now, we'll pass empty reviews array since we don't have reviews in the list view
      await generateStaffPDFReport(staff, groupedDuties, []);
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingStates(prev => ({ ...prev, [staffId]: false }));
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff?.phone?.includes(searchTerm);
    const matchesType =
      filterType === "All" || staff?.jobRole?.toLowerCase() === filterType;
    const matchesStatus =
      filterStatus === "All" || staff?.status === filterStatus;
    const matchesAvailability =
      filterAvailability === "All" ||
      (filterAvailability === "Available" && staff?.availability) ||
      (filterAvailability === "Unavailable" && !staff?.availability);
    return matchesSearch && matchesType && matchesAvailability && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search staff..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            setSearchTerm("");
            setFilterType("All");
            setFilterAvailability("All");
            setFilterStatus("All");
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="attendant">Attendant</option>
            <option value="nurse">Nurse</option>
            {/* <option value="Semi-Nurse">Semi-Nurses</option> */}
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="unregistered">Unregistered</option>
            <option value="registered">Registered</option>
            <option value="live">Live</option>
            <option value="suspended">Suspended</option>
          </select>

          <Button onClick={onAddStaff} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
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
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Experience
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStaff.length > 0 ? (
                currentStaff.map((staff) => {
                  const isSelected = batchMode && selectedStaffIds.includes(staff.id);
                  return (
                    <tr
                      key={staff.id}
                      className={`hover:bg-gray-50 ${batchMode && isSelected ? 'bg-green-50' : ''}`}
                    >
                      <td
                        className="px-6 cursor-pointer py-4 whitespace-nowrap flex items-center gap-2"
                        onClick={() => {
                          if (batchMode) {
                            onSelectStaff(staff.id);
                          } else {
                            onViewStaff(staff.id);
                          }
                        }}
                      >
                        {batchMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelectStaff(staff.id)}
                            onClick={e => e.stopPropagation()}
                            className="accent-green-600"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {staff?.name || staff?.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {capitalize(staff?.jobRole)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {staff?.phone
                            ? staff.phone.replace(/^(\+91|91)/, "")
                            : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {staff?.experienceYears} years
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {capitalize(staff?.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              // Prevent row click when clicking buttons
                              e.stopPropagation();
                              onEditStaff(staff);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              // Prepare the WhatsApp-formatted message
                              console.log("Staff details", staff);  
                              const name = staff?.name || staff?.fullName || "";
                              const age = staff?.dateOfBirth ? (() => {
                                const dob = new Date(staff.dateOfBirth);
                                const diffMs = Date.now() - dob.getTime();
                                const ageDt = new Date(diffMs);
                                return Math.abs(ageDt.getUTCFullYear() - 1970);
                              })() : null;
                              const gender = staff?.gender ? capitalize(staff.gender) : null;
                              const experience = staff?.experienceYears ? `${staff.experienceYears} years` : null;
                              let summary = [];
                              if (gender) summary.push(`• *Gender:* ${gender}`);
                              if (age) summary.push(`• *Age:* ${age}`);
                              if (experience) summary.push(`• *Experience:* ${experience}`);
                              const summaryText = summary.length > 0 ? `${summary.join("\n")}` : "";
                              const link = `zense.in/attendant/${staff.id}`;
                              // WhatsApp formatting: *bold*, \n for new lines
                              const message = `*${name}*\n${summaryText}\n\n*View Profile:* ${link}`;
                              try {
                                await navigator.clipboard.writeText(message);
                                toast({
                                  title: "Copied!",
                                  description: "Staff details copied in WhatsApp format.",
                                });
                              } catch (err) {
                                toast({
                                  title: "Copy failed",
                                  description: "Could not copy to clipboard.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(staff);
                            }}
                            disabled={downloadingStates[staff.id]}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            {downloadingStates[staff.id] ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                            ) : (
                              <ArrowDownToLine className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              // Prevent row click when clicking buttons
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this staff member?"
                                )
                              ) {
                                onDeleteStaff(staff.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No staff members found
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
    </div>
  );
};

export default StaffList;

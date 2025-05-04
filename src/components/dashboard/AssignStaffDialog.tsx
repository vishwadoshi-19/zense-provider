import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Staff, Job } from "@/types";
import { Search } from "lucide-react";

interface AssignStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: Staff[];
  jobToAssign: Job | null;
  onAssign: (staffId: string, jobId: string) => Promise<void>; // Updated type to return Promise<void>
}

const AssignStaffDialog = ({
  isOpen,
  onClose,
  staffList,
  jobToAssign,
  onAssign,
}: AssignStaffDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);

  useEffect(() => {
    // Filter staff to show only available staff (currentAssignment is null or undefined)
    const filtered = staffList.filter((staff) => !staff.currentAssignment);
    setAvailableStaff(filtered);
  }, [staffList]);

  const handleStaffSelect = async (staffId: string) => {
    // Made async to await onAssign
    if (jobToAssign) {
      await onAssign(staffId, jobToAssign.id); // Await the promise
      onClose();
    }
  };

  const filteredStaff = availableStaff.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Staff to Job</DialogTitle>
          <DialogDescription>
            Select an available staff member to assign to this job.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search staff..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 px-2 rounded-md"
                  onClick={() => handleStaffSelect(staff.id)}
                >
                  <div className="text-sm font-medium">{staff.name}</div>
                  <div className="text-xs text-gray-500">
                    {staff.contactNumber}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-500">
                No available staff found.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStaffDialog;

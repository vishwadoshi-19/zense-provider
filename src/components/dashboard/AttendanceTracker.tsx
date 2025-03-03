import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Attendance, Staff } from '@/types';
import { Search, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceTrackerProps {
  attendanceList: Attendance[];
  staffList: Staff[];
  onMarkAttendance: (staffId: string, status: 'Present' | 'Absent' | 'Late') => void;
  onRecordTime: (attendanceId: string, type: 'clockIn' | 'clockOut') => void;
}

const AttendanceTracker = ({ 
  attendanceList, 
  staffList, 
  onMarkAttendance, 
  onRecordTime 
}: AttendanceTrackerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Filter attendance records for the selected date
  const filteredAttendance = attendanceList.filter((attendance) => {
    const attendanceDate = format(attendance.date, 'yyyy-MM-dd');
    return attendanceDate === selectedDate;
  });

  // Get staff that don't have attendance records for the selected date
  const staffWithoutAttendance = staffList.filter((staff) => {
    return !filteredAttendance.some((attendance) => attendance.staffId === staff.id);
  });

  // Filter staff based on search term
  const filteredStaff = staffWithoutAttendance.filter((staff) => {
    return staff.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
        
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
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Today's Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock Out
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((attendance) => {
                  const staff = staffList.find(s => s.id === attendance.staffId);
                  return (
                    <tr key={attendance.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {staff?.name || 'Unknown Staff'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{staff?.type || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendance.clockIn ? (
                          <div className="text-sm text-gray-500">
                            {format(attendance.clockIn, 'hh:mm a')}
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onRecordTime(attendance.id, 'clockIn')}
                            disabled={attendance.status === 'Absent'}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Clock In
                          </Button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendance.clockOut ? (
                          <div className="text-sm text-gray-500">
                            {format(attendance.clockOut, 'hh:mm a')}
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onRecordTime(attendance.id, 'clockOut')}
                            disabled={!attendance.clockIn || attendance.status === 'Absent'}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Clock Out
                          </Button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onMarkAttendance(attendance.staffId, 'Present')}
                            className={`text-xs ${attendance.status === 'Present' ? 'bg-green-100' : ''}`}
                          >
                            Present
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onMarkAttendance(attendance.staffId, 'Late')}
                            className={`text-xs ${attendance.status === 'Late' ? 'bg-yellow-100' : ''}`}
                          >
                            Late
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onMarkAttendance(attendance.staffId, 'Absent')}
                            className={`text-xs ${attendance.status === 'Absent' ? 'bg-red-100' : ''}`}
                          >
                            Absent
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No attendance records for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStaff.length > 0 && (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Staff Without Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{staff.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onMarkAttendance(staff.id, 'Present')}
                        >
                          Mark Present
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onMarkAttendance(staff.id, 'Absent')}
                        >
                          Mark Absent
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;
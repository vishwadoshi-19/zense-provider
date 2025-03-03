import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/common/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Clock, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mock data for dashboard
  const dashboardData = {
    totalStaff: 24,
    activeStaff: 18,
    totalJobs: 15,
    pendingJobs: 3,
    completedJobs: 8,
    inProgressJobs: 4,
    attendanceToday: 16,
    absentToday: 2,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back to your provider dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalStaff}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.activeStaff} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.pendingJobs} pending, {dashboardData.inProgressJobs} in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.attendanceToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.absentToday} absent
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.completedJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((job) => (
                  <div key={job} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Patient Care - {job}</p>
                      <p className="text-sm text-gray-500">Assigned to: Staff Member {job}</p>
                    </div>
                    <div className="text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Progress
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Staff Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Attendants</p>
                    <p className="text-sm text-gray-500">8 out of 10 available</p>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Nurses</p>
                    <p className="text-sm text-gray-500">5 out of 8 available</p>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: '62.5%' }}></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Semi-Nurses</p>
                    <p className="text-sm text-gray-500">4 out of 6 available</p>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: '66.7%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
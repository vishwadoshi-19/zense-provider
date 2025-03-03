import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/components/auth/AuthContext';
import Layout from '@/components/common/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';

const ContactPage = () => {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Details</h1>
          <p className="text-gray-500 mt-1">Manage your contact information for customers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="primaryPhone" className="text-sm font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Primary Phone Number
                  </label>
                  <Input
                    id="primaryPhone"
                    defaultValue="9876543210"
                  />
                  <p className="text-xs text-gray-500">This number will be displayed to customers as your main contact</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="secondaryPhone" className="text-sm font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Secondary Phone Number
                  </label>
                  <Input
                    id="secondaryPhone"
                    defaultValue="9876543211"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="businessEmail" className="text-sm font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Business Email
                  </label>
                  <Input
                    id="businessEmail"
                    type="email"
                    defaultValue="contact@healthcaresolutions.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="supportEmail" className="text-sm font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Support Email
                  </label>
                  <Input
                    id="supportEmail"
                    type="email"
                    defaultValue="support@healthcaresolutions.com"
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit">
                    Update Contact Information
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="emergencyPhone" className="text-sm font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    24/7 Emergency Phone
                  </label>
                  <Input
                    id="emergencyPhone"
                    defaultValue="9876543212"
                  />
                  <p className="text-xs text-gray-500">This number will be used for urgent matters outside business hours</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="alternateEmergencyPhone" className="text-sm font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Alternate Emergency Phone
                  </label>
                  <Input
                    id="alternateEmergencyPhone"
                    defaultValue="9876543213"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="emergencyEmail" className="text-sm font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Emergency Email
                  </label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    defaultValue="emergency@healthcaresolutions.com"
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit">
                    Update Emergency Contacts
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="streetAddress" className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Street Address
                  </label>
                  <Input
                    id="streetAddress"
                    defaultValue="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      City
                    </label>
                    <Input
                      id="city"
                      defaultValue="Mumbai"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">
                      State
                    </label>
                    <Input
                      id="state"
                      defaultValue="Maharashtra"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="postalCode" className="text-sm font-medium">
                      Postal Code
                    </label>
                    <Input
                      id="postalCode"
                      defaultValue="400001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium">
                      Country
                    </label>
                    <Input
                      id="country"
                      defaultValue="India"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit">
                    Update Address
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="businessHours" className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Business Hours
                  </label>
                  <Input
                    id="businessHours"
                    defaultValue="Mon-Fri: 9 AM - 6 PM"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </label>
                  <Input
                    id="website"
                    defaultValue="https://healthcaresolutions.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="socialMedia" className="text-sm font-medium">
                    Social Media Handles
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Facebook"
                      defaultValue="@healthcaresolutions"
                    />
                    <Input
                      placeholder="Twitter"
                      defaultValue="@healthcare_sol"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit">
                    Update Additional Info
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
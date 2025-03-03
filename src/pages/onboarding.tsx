"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Onboarding = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    servicesOffered: string[];
    yearsInBusiness: string;
    businessAddress: string;
    contactNumbers: string;
    emergencyContactNumbers: string;
    panNumber: string;
    gstNumber: string;
    businessHours: string;
    serviceCities: string;
    attendantsCount: string;
    nursesCount: string;
    semiNursesCount: string;
    customersServed: string;
    attendant24HourShift: string;
    attendant12HourShift: string;
    attendant6HourShift: string;
    attendantDuration: string;
    semiNurse24HourShift: string;
    semiNurse12HourShift: string;
    semiNurse6HourShift: string;
    semiNurseDuration: string;
    nurse24HourShift: string;
    nurse12HourShift: string;
    nurse6HourShift: string;
    nurseDuration: string;
    replacementTime: string;
    responseTime: string;
    additionalInfo: string;
  }>({
    servicesOffered: [],
    yearsInBusiness: "",
    businessAddress: "",
    contactNumbers: "",
    emergencyContactNumbers: "",
    panNumber: "",
    gstNumber: "",
    businessHours: "",
    serviceCities: "",
    attendantsCount: "",
    nursesCount: "",
    semiNursesCount: "",
    customersServed: "",
    attendant24HourShift: "",
    attendant12HourShift: "",
    attendant6HourShift: "",
    attendantDuration: "",
    semiNurse24HourShift: "",
    semiNurse12HourShift: "",
    semiNurse6HourShift: "",
    semiNurseDuration: "",
    nurse24HourShift: "",
    nurse12HourShift: "",
    nurse6HourShift: "",
    nurseDuration: "",
    replacementTime: "",
    responseTime: "",
    additionalInfo: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        router.push("/login");
        return;
      }

      const db = getFirestore();
      await setDoc(doc(db, "providers", user.uid), {
        ...formData,
        email: user.email, // Include the email from Firebase auth
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      });

      console.log("Onboarding data saved:", formData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <a className="position-absolute top-5 right-5" href="/">
          <button className="px-10 py-3 text-black text-3xl">×</button>
        </a>
        <h1 className="text-3xl text-center font-semibold mb-8">
          Kindly enter your details below
        </h1>

        <div className="bg-white shadow-lg rounded-2xl p-8">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">
                Years in Business
              </label>
              <input
                type="number"
                name="yearsInBusiness"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Years"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Business Address
              </label>
              <input
                type="text"
                name="businessAddress"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Business Address"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Contact Number(s)
              </label>
              <input
                type="text"
                name="contactNumbers"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter numbers"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Emergency Contact Numbers (24x7)
              </label>
              <input
                type="text"
                name="emergencyContactNumbers"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Emergency Contacts"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Business PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="PAN Number"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Business GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="GST Number"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Business Hours (for Customer Query)
              </label>
              <input
                type="text"
                name="businessHours"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Business Hours"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Cities Where Service is Provided
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="serviceCities"
                  onChange={handleInputChange}
                  required
                  className="flex h-10 border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-2 border rounded-lg w-full"
                  placeholder="Search Cities"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2"></div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Number of Attendants Available
              </label>
              <select
                name="attendantsCount"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="1-10">1-10</option>
                <option value="11-30">11-30</option>
                <option value="31-50">31-50</option>
                <option value="51-100">51-100</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Number of Nurses Available
              </label>
              <select
                name="nursesCount"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="1-10">1-10</option>
                <option value="11-30">11-30</option>
                <option value="31-50">31-50</option>
                <option value="51-100">51-100</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Number of Semi-Nurses Available
              </label>
              <select
                name="semiNursesCount"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="1-10">1-10</option>
                <option value="11-30">11-30</option>
                <option value="31-50">31-50</option>
                <option value="51-100">51-100</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Customers Served in Last 3 Months
              </label>
              <select
                name="customersServed"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="Less than 50">Less than 50</option>
                <option value="51-100">51-100</option>
                <option value="101-300">101-300</option>
                <option value="301-1000">301-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Attendant Charges (for 24 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="attendant24HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Attendant Charges (for 12 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="attendant12HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Attendant Charges (for 6 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="attendant6HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Duration for which Attendant is Available
              </label>
              <select
                name="attendantDuration"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="3 Days/Week">3 Days/Week</option>
                <option value="5 Days/Week">5 Days/Week</option>
                <option value="1 Week">1 Week</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="4 Weeks+">4 Weeks+</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Semi-Nurse Charges (for 24 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="semiNurse24HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Semi-Nurse Charges (for 12 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="semiNurse12HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Semi-Nurse Charges (for 6 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="semiNurse6HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Duration for which Semi-Nurse is Available
              </label>
              <select
                name="semiNurseDuration"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="3 Days/Week">3 Days/Week</option>
                <option value="5 Days/Week">5 Days/Week</option>
                <option value="1 Week">1 Week</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="4 Weeks+">4 Weeks+</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Nurse Charges (for 24 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="nurse24HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Nurse Charges (for 12 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="nurse12HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Nurse Charges (for 6 Hour Shift, for 30+ days)
              </label>
              <input
                type="text"
                name="nurse6HourShift"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter charges"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Duration for which Nurse is Available
              </label>
              <select
                name="nurseDuration"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="3 Days/Week">3 Days/Week</option>
                <option value="5 Days/Week">5 Days/Week</option>
                <option value="1 Week">1 Week</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="4 Weeks+">4 Weeks+</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Services Offered by Attendants (other than Patient Care)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Grocery Buying",
                  "Laundry",
                  "Massage",
                  "Washroom Cleaning",
                  "Milk/Tea Preparation",
                  "Cab Booking",
                  "Help with Doctor Visits",
                  "Emergency Services",
                ].map((service) => (
                  <div
                    key={service}
                    className="flex items-center p-4 border rounded-lg cursor-pointer bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={service}
                      name="servicesOffered"
                      value={service}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        setFormData((prev) => {
                          const services = prev.servicesOffered || [];
                          if (checked) {
                            return {
                              ...prev,
                              servicesOffered: [...services, value],
                            };
                          } else {
                            return {
                              ...prev,
                              servicesOffered: services.filter(
                                (s) => s !== value
                              ),
                            };
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={service} className="text-sm text-gray-700">
                      {service}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Time to Provide Replacement
              </label>
              <select
                name="replacementTime"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="12 hours">12 hours</option>
                <option value="24 hours">24 hours</option>
                <option value="48 hours">48 hours</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Time Required to provide nurses/attendants?
              </label>
              <input
                type="text"
                name="responseTime"
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Time Required"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Extra information you would like to add?
              </label>
              <textarea
                name="additionalInfo"
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
                placeholder="Any additional information you would like to add"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-700 text-white rounded-lg py-3 hover:bg-teal-800 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

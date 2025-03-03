import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const signupSchema = z.object({
  businessName: z.string().min(2, { message: 'Business name is required' }),
  ownerName: z.string().min(2, { message: 'Owner name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  contactNumber: z.string().min(10, { message: 'Please enter a valid contact number' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const { signup, isOffline } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    if (isOffline) {
      setError("You're currently offline. Please check your internet connection and try again.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const providerData = {
        businessName: data.businessName,
        ownerName: data.ownerName,
        contactNumber: data.contactNumber,
      };
      
      await signup(data.email, data.password, providerData);
      router.push('/onboarding');
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Enter your details to create a provider account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        {isOffline && !error && (
          <div className="bg-amber-50 text-amber-700 p-3 rounded-md mb-4 text-sm">
            You're currently offline. Sign up requires an internet connection.
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="businessName" className="text-sm font-medium">
              Business Name
            </label>
            <Input
              id="businessName"
              placeholder="Your Business Name"
              {...register('businessName')}
              className={errors.businessName ? 'border-red-500' : ''}
            />
            {errors.businessName && (
              <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="ownerName" className="text-sm font-medium">
              Owner Name
            </label>
            <Input
              id="ownerName"
              placeholder="Your Name"
              {...register('ownerName')}
              className={errors.ownerName ? 'border-red-500' : ''}
            />
            {errors.ownerName && (
              <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contactNumber" className="text-sm font-medium">
              Contact Number
            </label>
            <Input
              id="contactNumber"
              placeholder="Your Contact Number"
              {...register('contactNumber')}
              className={errors.contactNumber ? 'border-red-500' : ''}
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || isOffline}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;
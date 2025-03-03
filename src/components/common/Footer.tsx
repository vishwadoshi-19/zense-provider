import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Nurch. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
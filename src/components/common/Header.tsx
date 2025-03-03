import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { UserCircle, Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Handle logout logic here
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-primary">Nurch</span>
            <span className="ml-2 text-sm bg-accent text-white px-2 py-0.5 rounded">
              Provider
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={toggleMenu}
            >
              <UserCircle className="h-6 w-6" />
              <span>My Account</span>
            </Button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="sm" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <Link href="/profile" className="block py-2 text-gray-700">
              Profile
            </Link>
            <Link href="/settings" className="block py-2 text-gray-700">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2 text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

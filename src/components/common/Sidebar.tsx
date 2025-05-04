import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Clock,
  UserCircle,
  Phone,
  Settings,
  HelpCircle,
} from "lucide-react";

const Sidebar = () => {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Manage Staff",
      path: "/staff",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Assign Jobs",
      path: "/jobs",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: "Track Availability",
      path: "/availability",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Track Work",
      path: "/attendance",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      name: "Contact Details",
      path: "/contact",
      icon: <Phone className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 w-64 h-screen fixed left-0 top-0 pt-16 hidden md:block">
      <div className="px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 text-sm rounded-md ${
                isActive(item.path)
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <nav className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center px-4 py-3 text-sm rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
              <span className="ml-3">Settings</span>
            </Link>
            <Link
              href="/help"
              className="flex items-center px-4 py-3 text-sm rounded-md text-gray-700 hover:bg-gray-100"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="ml-3">Help & Support</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

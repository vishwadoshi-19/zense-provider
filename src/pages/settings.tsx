import { useRouter } from "next/router";

const Settings = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Handle logout logic here
    router.push("/login");
  };
  return (
    <>
      <div>Settings page</div>
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    </>
  );
};

export default Settings;

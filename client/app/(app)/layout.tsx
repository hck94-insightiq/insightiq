import SideBar from "@/components/shared/SideBar";
import Navbar from "@/components/shared/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex-1 ml-56 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}

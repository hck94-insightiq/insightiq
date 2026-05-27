import SideBar from "@/components/shared/SideBar";
import Navbar from "@/components/shared/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="ml-56 flex min-h-screen flex-1 flex-col">
        <Navbar />
        <main className="flex-1 px-8 pb-16 pt-24 bg-background">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

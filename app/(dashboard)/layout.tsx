import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden w-[260px] shrink-0 lg:flex lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-[260px]">
        {/* Mobile top nav */}
        <MobileNav />

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 scrollbar-thin overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

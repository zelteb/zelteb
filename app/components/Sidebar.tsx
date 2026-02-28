import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4f4f0] font-sans text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
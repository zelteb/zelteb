import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="md:ml-64 w-full min-h-screen bg-white pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
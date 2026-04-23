import BrandSidebar from "@/components/BrandSidebar";

export default function BrandDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <BrandSidebar />
      <main className="md:ml-64 w-full min-h-screen bg-white pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
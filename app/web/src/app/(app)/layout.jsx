import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
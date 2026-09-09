import Sidebar from "@/components/Sidebar";
import { AIServiceProvider } from "@/lib/aiServiceContext";

export default function AppLayout({ children }) {
  return (
    <AIServiceProvider>
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </AIServiceProvider>
  );
}
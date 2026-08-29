import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function AnomalyBadge({ flag }) {
  return (
    <Badge variant="destructive" className="gap-1 text-xs">
      <AlertTriangle className="h-3 w-3" />
      {flag}
    </Badge>
  );
}
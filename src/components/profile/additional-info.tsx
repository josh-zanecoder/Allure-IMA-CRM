import { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AdditionalInfoProps {
  user: User;
}

export function AdditionalInfo({ user }: AdditionalInfoProps) {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge variant="approved">Active</Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Last Login</p>
          <p>{format(new Date(), "PPpp")}</p>
        </div>
      </div>
    </div>
  );
}

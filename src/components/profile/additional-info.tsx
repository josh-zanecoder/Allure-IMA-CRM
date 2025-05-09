import { User } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AdditionalInfoProps {
  user: User;
}

export function AdditionalInfo({ user }: AdditionalInfoProps) {
  return (
    <div className="mt-3 sm:mt-6 space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">
        Additional Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
          <Badge variant="approved" className="text-xs sm:text-sm">
            Active
          </Badge>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-muted-foreground">Last Login</p>
          <p className="text-sm sm:text-base">{format(new Date(), "PPpp")}</p>
        </div>
      </div>
    </div>
  );
}

import { User } from "@/types/auth";
import { User as UserIcon, Building, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ProfessionalInfoProps {
  user: User;
}

export function ProfessionalInfo({ user }: ProfessionalInfoProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">
        Professional Information
      </h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm sm:text-base break-all">ID: {user.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm sm:text-base">Department: Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm sm:text-base">
            Member since: {format(new Date(), "MMMM yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}

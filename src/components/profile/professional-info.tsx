import { User } from "@/types/auth";
import { User as UserIcon, Building, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ProfessionalInfoProps {
  user: User;
}

export function ProfessionalInfo({ user }: ProfessionalInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Professional Information</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span>ID: {user.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>Department: Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Member since: {format(new Date(), "MMMM yyyy")}</span>
        </div>
      </div>
    </div>
  );
}

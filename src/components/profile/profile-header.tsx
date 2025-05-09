import { User } from "@/types/auth";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "@/utils/formatters";

interface ProfileHeaderProps {
  user: User;
}

const getInitials = (firstName: string | null, lastName: string | null) => {
  if (!firstName && !lastName) return "SP";
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <CardHeader className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-6 pb-3 sm:pb-4 text-center sm:text-left">
      <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
        <AvatarFallback>
          {getInitials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 mt-2 sm:mt-0">
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {user.firstName} {user.lastName}
        </CardTitle>

        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-1 sm:mt-2 capitalize">
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {user.role}
          </Badge>
          {user.twilioNumber && (
            <Badge variant="outline" className="text-xs sm:text-sm">
              Twilio:{" "}
              {user.twilioNumber ? formatPhoneNumber(user.twilioNumber) : "N/A"}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

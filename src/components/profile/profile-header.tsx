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
    <CardHeader className="flex flex-row items-center gap-4 pb-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
        <AvatarFallback>
          {getInitials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <CardTitle className="text-2xl font-bold">
          {user.firstName} {user.lastName}
        </CardTitle>
        <div className="flex items-center gap-2 mt-1 capitalize">
          <Badge variant="secondary">{user.role}</Badge>
          {user.twilioNumber && (
            <Badge variant="outline">
              Twilio:{" "}
              {user.twilioNumber ? formatPhoneNumber(user.twilioNumber) : "N/A"}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

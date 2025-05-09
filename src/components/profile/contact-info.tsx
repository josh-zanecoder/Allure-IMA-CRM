import { User } from "@/types/auth";
import { Mail, Phone, MapPin } from "lucide-react";

interface ContactInfoProps {
  user: User;
}

export function ContactInfo({ user }: ContactInfoProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">
        Contact Information
      </h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm sm:text-base break-words">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm sm:text-base">{user.phone}</span>
          </div>
        )}
        {user.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-sm sm:text-base">{user.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}

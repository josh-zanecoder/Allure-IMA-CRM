import { User } from "@/types/auth";
import { Mail, Phone, MapPin } from "lucide-react";

interface ContactInfoProps {
  user: User;
}

export function ContactInfo({ user }: ContactInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{user.phone}</span>
          </div>
        )}
        {user.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{user.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}

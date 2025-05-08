"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ContactInfo } from "@/components/profile/contact-info";
import { ProfessionalInfo } from "@/components/profile/professional-info";
import { AdditionalInfo } from "@/components/profile/additional-info";

export default function SalesPersonProfile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Profile Header - Spans full width */}
          <div className="col-span-12">
            <Card className="w-full">
              <ProfileHeader user={user} />
            </Card>
          </div>

          {/* Contact Information - Spans 5 columns */}
          <div className="col-span-12 md:col-span-5">
            <Card className="w-full h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent>
                <ContactInfo user={user} />
              </CardContent>
            </Card>
          </div>

          {/* Professional Information - Spans 7 columns */}
          <div className="col-span-12 md:col-span-7">
            <Card className="w-full h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent>
                <ProfessionalInfo user={user} />
              </CardContent>
            </Card>
          </div>

          {/* Additional Information - Spans full width */}
          <div className="col-span-6">
            <Card className="w-full hover:shadow-lg transition-shadow duration-200">
              <CardContent>
                <AdditionalInfo user={user} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

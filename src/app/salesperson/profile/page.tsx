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
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
          {/* Profile Header - Spans full width */}
          <div className="col-span-1 sm:col-span-6 md:col-span-12">
            <Card className="w-full">
              <ProfileHeader user={user} />
            </Card>
          </div>

          {/* Contact Information */}
          <div className="col-span-1 sm:col-span-6 md:col-span-5">
            <Card className="w-full h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-3 sm:p-5 md:p-6">
                <ContactInfo user={user} />
              </CardContent>
            </Card>
          </div>

          {/* Professional Information */}
          <div className="col-span-1 sm:col-span-6 md:col-span-7">
            <Card className="w-full h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-3 sm:p-5 md:p-6">
                <ProfessionalInfo user={user} />
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="col-span-1 sm:col-span-6 md:col-span-6">
            <Card className="w-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-3 sm:p-5 md:p-6">
                <AdditionalInfo user={user} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

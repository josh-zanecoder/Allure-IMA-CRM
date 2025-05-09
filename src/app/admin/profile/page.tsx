"use client";

import { useEffect } from "react";
import { useProspectStore } from "@/store/useProspectStore";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Shield,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export default function AdminProfilePage() {
  const { profileData, isLoading, error, fetchAdminProfile } =
    useProspectStore();

  // Load user data on component mount
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  // Generate avatar initials
  const getInitials = () => {
    if (!profileData) return "AD";
    return (
      `${profileData.firstName?.charAt(0) || ""}${
        profileData.lastName?.charAt(0) || ""
      }`.toUpperCase() || "AD"
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  function formatPhoneNumber(
    twilio_phone_number: any
  ): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">View your account information</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Profile sidebar */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData?.avatar || ""} />
                <AvatarFallback className="text-lg font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-medium">
                  {profileData?.firstName} {profileData?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profileData?.email}
                </p>
              </div>
              <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Shield className="mr-1 h-3 w-3" />
                Administrator
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information display */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal and account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          <Shield className="mr-2 h-4 w-4" />
                          Role
                        </dt>
                        <dd className="text-sm">Administrator</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </dt>
                        <dd className="text-sm">
                          {profileData?.email || "Not available"}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          <Phone className="mr-2 h-4 w-4" />
                          Phone
                        </dt>
                        <dd className="text-sm">
                          {profileData?.phone
                            ? formatPhoneNumber(profileData?.phone)
                            : "Not available"}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          <Calendar className="mr-2 h-4 w-4" />
                          Status
                        </dt>
                        <dd className="text-sm">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            {profileData?.status || "Active"}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          User ID
                        </dt>
                        <dd className="text-sm overflow-hidden text-ellipsis">
                          {profileData?.id || "Not available"}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          Firebase
                        </dt>
                        <dd className="text-sm overflow-hidden text-ellipsis">
                          {profileData?.firebase_uid
                            ? profileData.firebase_uid.substring(0, 12) + "..."
                            : "Not available"}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          Google
                        </dt>
                        <dd className="text-sm">
                          {profileData?.googleLinked ? (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                              Linked
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                              Not linked
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="flex items-center text-sm font-medium text-muted-foreground w-24">
                          Twilio
                        </dt>
                        <dd className="text-sm">
                          {profileData?.twilio_phone_number
                            ? formatPhoneNumber(profileData.twilio_phone_number)
                            : "Not configured"}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  Clock,
  Sparkles,
  MessageSquare,
  User,
  Key,
  RefreshCw,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import axios from "axios";
import { formatPhoneNumber } from "@/utils/formatters";

interface SalesPerson {
  id: string;
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  firebase_uid?: string;
  twilio_number?: string;
  status?: string;
  role?: string;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}

export default function SalesPersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [salesperson, setSalesperson] = useState<SalesPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalesPerson() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/admin/salespersons/${id}`);
        if (res.status !== 200) throw new Error("Failed to fetch salesperson");
        const data = res.data;
        setSalesperson(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSalesPerson();
  }, [id]);

  if (loading)
    return (
      <div className="w-full px-7 py-0">
        <div className="w-full max-w-6xl mx-auto">
          <Button variant="outline" className="mb-6" disabled>
            <Skeleton className="w-16 h-6" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card Skeleton */}
            <Card className="col-span-full lg:col-span-1 rounded-2xl shadow-xl overflow-hidden border-primary/20 border-2">
              <div className="h-32 bg-muted/20"></div>
              <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full ring-4 ring-primary/20 shadow-lg" />

                <div className="mt-4 text-center w-full">
                  <Skeleton className="h-8 w-48 mx-auto rounded-md" />
                  <Skeleton className="h-6 w-24 mt-2 mx-auto rounded-full" />
                  <Skeleton className="h-5 w-32 mt-2 mx-auto rounded-md" />
                </div>

                <Skeleton className="h-px w-full my-6" />

                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-full rounded-md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-full rounded-md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-full rounded-md" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Right Column Skeletons */}
            <div className="col-span-full lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details Skeleton */}
              <Card className="rounded-2xl shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-40 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1.5 rounded-md" />
                        <Skeleton className="h-5 w-full rounded-md" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Timeline Skeleton */}
              <Card className="rounded-2xl shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1.5 rounded-md" />
                        <Skeleton className="h-5 w-full rounded-md" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Artistry Profile Skeleton */}
              <Card className="col-span-full rounded-2xl shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-48 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="aspect-square rounded-lg" />
                    <div className="col-span-2 p-6 rounded-lg border border-primary/20">
                      <Skeleton className="h-6 w-40 rounded-md" />
                      <Skeleton className="h-4 w-full mt-2 rounded-md" />
                      <Skeleton className="h-4 w-3/4 mt-1 rounded-md" />

                      <Skeleton className="h-px w-full my-4" />

                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i}>
                            <Skeleton className="h-4 w-16 mb-1.5 rounded-md" />
                            <Skeleton className="h-5 w-24 rounded-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!salesperson)
    return <div className="p-8 text-center">No data found.</div>;

  const getInitials = (first: string, last: string) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="w-full px-7 py-0">
      <div className="w-full max-w-6xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 group transition-all duration-300 hover:bg-primary/10"
          onClick={() => router.back()}
        >
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>{" "}
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <Card className="col-span-full lg:col-span-1 rounded-2xl shadow-xl overflow-hidden border-primary/20 border-2">
            <div className="h-18"></div>
            <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-lg bg-background">
                <AvatarImage
                  src={salesperson.avatarUrl || ""}
                  alt={salesperson.first_name + " " + salesperson.last_name}
                />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {getInitials(salesperson.first_name, salesperson.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold">
                  {salesperson.first_name} {salesperson.last_name}
                </h2>
                <Badge
                  className="mt-2 flex items-center justify-center gap-1 capitalize px-3 py-1"
                  variant={
                    salesperson.status === "active" ? "default" : "secondary"
                  }
                >
                  {salesperson.status === "active" ? (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  {salesperson.status || "Unknown"}
                </Badge>
                <p className="text-muted-foreground mt-1 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  {salesperson.role || "Salesperson"}
                </p>
              </div>

              <Separator className="my-6 w-full" />

              <div className="space-y-4 w-full">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate">{salesperson.email}</span>
                </div>
                {salesperson.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Phone: {formatPhoneNumber(salesperson.phone)}
                    </span>
                  </div>
                )}
                {salesperson.twilio_number && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1">
                      Twilio: {formatPhoneNumber(salesperson.twilio_number)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Details Cards */}
          <div className="col-span-full lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Membership Details */}
            <Card className="rounded-2xl shadow-lg border-primary/10 hover:border-primary/30 transition-colors overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Key className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">MongoDB ID</p>
                    <p className="text-sm font-medium break-all">
                      {salesperson.id || salesperson._id}
                    </p>
                  </div>
                </div>

                {salesperson.firebase_uid && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        Firebase UID
                      </p>
                      <p className="text-sm font-medium break-all">
                        {salesperson.firebase_uid}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Join Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(salesperson.joinDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="rounded-2xl shadow-lg border-primary/10 hover:border-primary/30 transition-colors overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Created At</p>
                    <p className="text-sm font-medium">
                      {formatDate(salesperson.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RefreshCw className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(salesperson.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artistic Visualization */}
            <Card className="col-span-full rounded-2xl shadow-lg border-primary/10 hover:border-primary/30 transition-colors overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Allure IMA Artistry Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-muted/50 rounded-lg text-center flex flex-col items-center justify-center aspect-square">
                    <h3 className="font-semibold">
                      {salesperson.first_name} {salesperson.last_name}
                    </h3>
                    <div className="mt-2 text-sm opacity-80">
                      Creative Representative
                    </div>
                    <div className="mt-auto text-xs text-primary">
                      Allure IMA College
                    </div>
                  </div>

                  <div className="col-span-2 p-6 rounded-lg flex flex-col justify-between border border-primary/20">
                    <div>
                      <div className="font-medium text-lg">
                        Salesperson Profile
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Part of Allure IMA's creative team helping students
                        discover their artistic path.
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="text-sm font-medium">
                          {salesperson.role || "Salesperson"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-medium capitalize">
                          {salesperson.status || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Member Since
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(salesperson.joinDate).split(",")[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="text-sm font-medium truncate">
                          {salesperson.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

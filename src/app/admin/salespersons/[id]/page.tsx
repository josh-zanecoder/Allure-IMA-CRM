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
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesPerson {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export default function SalesPersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [salesperson, setSalesperson] = useState<SalesPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(salesperson);

  useEffect(() => {
    async function fetchSalesPerson() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/salespersons/${id}`);
        if (!res.ok) throw new Error("Failed to fetch salesperson");
        const data = await res.json();
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
      <div className="w-full px-7 py-12">
        <div className="w-full max-w-5xl mx-auto">
          <Button variant="outline" className="mb-6" disabled>
            <Skeleton className="w-16 h-6" />
          </Button>
          <Card className="w-full rounded-2xl shadow-xl border-l-4 border-primary/80">
            <CardHeader className="flex flex-row items-center gap-6 pb-6 bg-transparent">
              <Skeleton className="h-24 w-24 rounded-full ring-4 ring-primary/20 shadow-lg" />
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-48 rounded" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-32 rounded" />
              </div>
            </CardHeader>
            <Separator className="mb-4" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Skeleton className="h-6 w-40 mb-2 rounded" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-56 rounded" />
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-5 w-48 rounded" />
                  </div>
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-6 w-40 mb-2 rounded" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-56 rounded" />
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-5 w-48 rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!salesperson)
    return <div className="p-8 text-center">No data found.</div>;

  const getInitials = (first: string, last: string) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  return (
    <div className="w-full px-7 py-12">
      <div className="w-full max-w-5xl mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <Card className="w-full rounded-2xl shadow-xl border-l-4 border-primary/80">
          <CardHeader className="flex flex-row items-center gap-6 pb-6 bg-transparent">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-lg">
              <AvatarImage
                src={salesperson.avatarUrl || ""}
                alt={salesperson.first_name + " " + salesperson.last_name}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(salesperson.first_name, salesperson.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl font-bold mb-0">
                  {salesperson.first_name} {salesperson.last_name}
                </CardTitle>
                <Badge
                  className="flex items-center gap-1 capitalize text-base px-3 py-1"
                  variant={
                    salesperson.status === "active" ? "approved" : "secondary"
                  }
                >
                  {salesperson.status === "active" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  {salesperson.status ? salesperson.status : "Unknown"}
                </Badge>
              </div>
              <div className="text-muted-foreground text-base font-medium">
                Salesperson
              </div>
            </div>
          </CardHeader>
          <Separator className="mb-4" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-2">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{salesperson.email}</span>
                  </div>
                  {salesperson.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{salesperson.phone}</span>
                    </div>
                  )}
                  {salesperson.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{salesperson.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-2">Meta Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>ID: {salesperson._id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Created:{" "}
                      {salesperson.createdAt
                        ? new Date(salesperson.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePaginationStore } from "@/store/usePaginationStore";
import { useCallStore } from "@/store/useCallStore";
import { Prospect } from "@/types/prospect";
import { formatAddress, formatPhoneNumber } from "@/utils/formatters";
import { toast } from "sonner";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  Search,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Utility function to remove special characters from phone number
const unformatPhoneNumber = (phone: string) => {
  return phone.replace(/[^\d+]/g, "");
};

export function ProspectList() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    prospects,
    isLoading: isLoadingProspects,
    fetchProspects,
  } = usePaginationStore();
  const { makeCall, isCalling } = useCallStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [prospectToDelete, setProspectToDelete] = useState<Prospect | null>(
    null
  );

  const handleRowClick = (prospectId: string) => {
    router.push(`/salesperson/prospects/${prospectId}/details`);
  };

  const handleMakeCall = (prospect: Prospect) => {
    makeCall({
      To: `+1${unformatPhoneNumber(prospect.phone)}`,
      CallerId: `+1${unformatPhoneNumber(user?.twilioNumber || "")}`,
      UserId: user?.uid ?? "",
      ProspectId: prospect.id,
    });
  };

  const handleSendEmail = (prospect: Prospect) => {
    const subject = `Regarding ${prospect.fullName}`;
    const body = `Hello,\n\nI hope this email finds you well. I wanted to reach out regarding ${prospect.fullName}.\n\nBest regards,\n${prospect.assignedTo.email}`;

    const mailtoLink = `mailto:${prospect.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Open in a new tab to avoid navigation issues
    window.open(mailtoLink, "_blank");
  };

  const handleDeleteProspect = async (prospect: Prospect) => {
    setProspectToDelete(prospect);
  };

  const confirmDelete = async () => {
    if (!prospectToDelete) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting prospect...");

    try {
      const response = await axios.delete(
        `/api/prospects/${prospectToDelete.id}`
      );

      if (response.status === 200) {
        // After deleting, refresh prospects
        fetchProspects();
        toast.success("Prospect deleted successfully", { id: loadingToast });
      } else {
        throw new Error(response.data.error || "Failed to delete prospect");
      }
    } catch (error) {
      console.error("Error deleting prospect:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete prospect",
        { id: loadingToast }
      );
    } finally {
      setIsDeleting(false);
      setProspectToDelete(null);
    }
  };

  if (isLoadingProspects) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-5"></TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">
                  Education Level
                </TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  Last Contact
                </TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell className="w-5">
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="w-8">
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-5"></TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Education Level
                    </TableHead>
                    <TableHead className="hidden sm:table-cell text-right">
                      Last Contact
                    </TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects.map((prospect) => (
                    <TableRow
                      key={prospect.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleRowClick(prospect.id)}
                    >
                      <TableCell className="w-5"></TableCell>
                      <TableCell>
                        <Badge variant="outline">{prospect.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {prospect.fullName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {prospect.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeCall(prospect);
                          }}
                          disabled={isCalling}
                        >
                          <Phone className="h-4 w-4 text-primary" />
                          {formatPhoneNumber(prospect.phone)}
                        </Button>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span>{formatAddress(prospect.address)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={
                            prospect.educationLevel ? "outline" : "destructive"
                          }
                          className={
                            prospect.educationLevel
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                              : ""
                          }
                        >
                          {prospect.educationLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        {new Date(prospect.lastContact).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        className="w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(prospect.id);
                              }}
                            >
                              <User className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakeCall(prospect);
                              }}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendEmail(prospect);
                              }}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProspect(prospect);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {prospects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {prospects.map((prospect) => (
          <Card
            key={prospect.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors p-2"
          >
            <CardHeader className="pb-1 px-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle
                    className="hover:text-primary cursor-pointer text-base"
                    onClick={() =>
                      router.push(
                        `/salesperson/prospects/${prospect.id}/details`
                      )
                    }
                  >
                    {prospect.fullName}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {prospect.educationLevel}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs py-0.5 px-2">
                  {prospect.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-2 pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 h-auto p-0 hover:text-primary text-xs"
                    onClick={() => handleMakeCall(prospect)}
                    disabled={isCalling}
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    {formatPhoneNumber(prospect.phone)}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{prospect.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{formatAddress(prospect.address)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{prospect.dateOfBirth}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned to {prospect.assignedTo.email}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Badge
                  variant={prospect.educationLevel ? "default" : "destructive"}
                  className={
                    prospect.educationLevel
                      ? "bg-green-100 text-green-800 text-xs"
                      : "text-xs"
                  }
                >
                  {prospect.educationLevel}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => handleRowClick(prospect.id)}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => handleMakeCall(prospect)}
                  disabled={isCalling}
                >
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!prospectToDelete}
        onOpenChange={() => setProspectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              prospect
              {prospectToDelete && ` "${prospectToDelete.fullName}"`} and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Prospect } from "@/types/prospect";
import { formatAddress, formatPhoneNumber } from "@/utils/formatters";
import { useCallStore } from "@/store/useCallStore";
import { useDebouncedCallback } from "use-debounce";
import { Plus, Phone, Mail, MapPin, Globe, User, Search } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/useUserStore";
import axios from "axios";
import { InteractionType, InteractionStatus } from "@/models/InteractionRecord";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal } from "lucide-react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
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

// Utility function to remove special characters from phone number
const unformatPhoneNumber = (phone: string) => {
  return phone.replace(/[^\d+]/g, "");
};

export default function ProspectsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoadingProspects, setIsLoadingProspects] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { makeCall, isCalling } = useCallStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [progress, setProgress] = useState(0);
  const fetchStudents = useUserStore((state) => state.fetchStudents);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prospectToDelete, setProspectToDelete] = useState<Prospect | null>(
    null
  );

  // Define callbacks using useCallback
  const handleRowClick = useCallback(
    (prospectId: string) => {
      router.push(`/salesperson/prospects/${prospectId}/details`);
    },
    [router]
  );

  const debouncedSearch = useDebouncedCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, 300);

  // Move all useEffects here
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "salesperson")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setIsLoadingProspects(true);
        const searchParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
        });

        if (searchQuery) {
          searchParams.append("search", searchQuery);
        }

        const response = await fetch(
          `/api/prospects?${searchParams.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch prospects");
        }
        const data = await response.json();
        setProspects(data.prospects);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching prospects:", error);
      } finally {
        setIsLoadingProspects(false);
      }
    };

    if (user) {
      fetchProspects();
    }
  }, [user, currentPage, searchQuery]);

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 10;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  // const handleAddProspect = async (
  //   newStudent: Omit<Student, "id" | "createdAt" | "updatedAt">
  // ) => {
  //   const loadingToast = toast.loading("Saving student...");
  //   try {
  //     const response = await axios.post("/api/prospects/create", {
  //       ...newStudent,
  //       fullName: `${newStudent.firstName} ${newStudent.lastName}`,
  //       firstName: newStudent.firstName,
  //       lastName: newStudent.lastName,
  //       phone: newStudent.phone,
  //       email: newStudent.email,
  //       address: newStudent.address,
  //       educationLevel: newStudent.educationLevel,
  //       dateOfBirth: new Date(newStudent.dateOfBirth),
  //       preferredContactMethod: newStudent.preferredContactMethod,
  //       interests: newStudent.interests,
  //       status: "New",
  //       notes: newStudent.notes || "",
  //       lastContact: new Date().toISOString().split("T")[0],
  //     });

  //     if (response.status !== 200) {
  //       const errorData = response.data;
  //       toast.error(errorData.error || "Failed to create student", {
  //         id: loadingToast,
  //       });
  //       return;
  //     }

  //     const createdStudent = response.data;
  //     setProspects((prev) => [...prev, createdStudent]);
  //     setIsModalOpen(false);
  //     toast.success("Student added successfully", {
  //       id: loadingToast,
  //     });
  //     await fetchStudents();
  //   } catch (error) {
  //     console.error("Error creating student:", error);
  //     toast.error(
  //       error instanceof Error ? error.message : "Failed to create student",
  //       { id: loadingToast }
  //     );
  //   }
  // };

  const handleMakeCall = async (prospect: Prospect) => {
    try {
      const callId = `call_${Date.now()}`;
      const tempCallSid = `temp_${Date.now()}`;

      // Create call log entry
      const callLogData = {
        to: `+1${unformatPhoneNumber(prospect.phone)}`,
        from: `+1${unformatPhoneNumber(user?.twilioNumber || "")}`,
        userId: user?.uid ?? "",
        prospectId: prospect.id,
        callSid: tempCallSid,
        activityId: callId,
        transcription: "Pending transcription", // Non-empty default value
      };

      // Log the call
      const logResponse = await axios.post(
        "/api/salesperson/call-logs",
        callLogData
      );

      if (logResponse.status !== 200 && logResponse.status !== 201) {
        throw new Error("Failed to log call");
      }

      // Create interaction record
      const interactionData = {
        userId: callLogData.userId,
        prospectId: callLogData.prospectId,
        interactionId: `interaction_${Date.now()}`,
        interactionType: InteractionType.CALL,
        subject: `Call to ${prospect.fullName}`,
        details: `Outbound phone call to ${
          prospect.fullName
        } at ${formatPhoneNumber(prospect.phone)}`,
        status: InteractionStatus.INITIATED,
        startTime: new Date(),
        extraData: {
          callSid: callLogData.callSid,
          to: callLogData.to,
          from: callLogData.from,
          direction: "outbound",
        },
      };

      // Save the interaction record
      try {
        const interactionResponse = await axios.post(
          "/api/interactions",
          interactionData
        );
        console.log("Interaction record created", interactionResponse.data);
      } catch (interactionError) {
        console.warn(
          "Failed to create interaction record, but continuing with call",
          interactionError
        );
      }

      // Make the call
      makeCall({
        To: callLogData.to,
        CallerId: callLogData.from,
        UserId: callLogData.userId,
        ProspectId: callLogData.prospectId,
      });
    } catch (error) {
      console.error("Error preparing call:", error);
      toast.error("Failed to prepare call, but proceeding with call");

      // Still make the call even if logging fails
      makeCall({
        To: `+1${unformatPhoneNumber(prospect.phone)}`,
        CallerId: `+1${unformatPhoneNumber(user?.twilioNumber || "")}`,
        UserId: user?.uid ?? "",
        ProspectId: prospect.id,
      });
    }
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
        setProspects((prev) =>
          prev.filter((p) => p.id !== prospectToDelete.id)
        );
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

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 w-[200px]">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">Loading prospects...</p>
        </div>
      </div>
    );
  }

  // Render null state
  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-gray-100 text-gray-800";
      case "Contacted":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-green-100 text-green-800";
      case "Proposal":
        return "bg-purple-100 text-purple-800";
      case "Negotiation":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Prospects
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and track your prospects
          </p>
        </div>
        <Button
          onClick={() => router.push("/salesperson/prospects/new")}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Prospect
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center space-x-2 pb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prospects..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoadingProspects ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-5"></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Full Name</TableHead>
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
      ) : (
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
                                prospect.educationLevel
                                  ? "outline"
                                  : "destructive"
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
                            {new Date(
                              prospect.lastContact
                            ).toLocaleDateString()}
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
                    <h3 className="mt-4 text-lg font-semibold">
                      No results found
                    </h3>
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
                      variant={
                        prospect.educationLevel ? "default" : "destructive"
                      }
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
        </>
      )}

      {/* <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProspect}
      /> */}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {totalCount === 0 ? (
            <>Showing 0 results</>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * 10, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span> results
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add Alert Dialog */}
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
    </div>
  );
}

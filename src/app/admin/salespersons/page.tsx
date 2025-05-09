"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AddSalespersonModal from "@/components/admin/AddSalespersonModal";
import { Salesperson } from "@/types/salesperson";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  User,
  Phone,
  Calendar,
  MoreVertical,
  Edit,
  Trash,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { useUserStore } from "@/store/useUserStore";
import { formatPhoneNumber } from "@/utils/formatters";
import axios from "axios";
import { toast } from "sonner";

export default function SalespersonsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { salespersons, fetchSalespersons, isStoreLoading } = useUserStore();
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSalesperson, setDeletingSalesperson] =
    useState<Salesperson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadSalespersons = async () => {
      try {
        await fetchSalespersons();
      } catch (e) {
        console.error("Error fetching salespersons:", e);
        setError("Failed to load salespersons data. Please try again.");
      }
    };

    loadSalespersons();
  }, [fetchSalespersons]);

  const filteredSalespersons = salespersons.filter((person) => {
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || person.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredSalespersons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSalespersons = filteredSalespersons.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handle delete salesperson
  const handleDeleteSalesperson = async () => {
    if (!deletingSalesperson) return;

    const loadingToast = toast.loading("Deleting salesperson...");
    try {
      setIsDeleting(true);
      await axios.delete(`/api/admin-salespersons/${deletingSalesperson.id}`);
      await fetchSalespersons();
      toast.success("Salesperson deleted successfully", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error deleting salesperson:", error);
      toast.error("Failed to delete salesperson", {
        id: loadingToast,
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingSalesperson(null);
    }
  };

  const openDeleteDialog = (person: Salesperson) => {
    setDeletingSalesperson(person);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-64" />
          <Skeleton className="h-5 sm:h-6 w-48" />
        </div>

        {/* Controls Skeleton */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Skeleton className="h-10 w-full sm:w-[300px]" />
          <Skeleton className="h-10 w-full sm:w-[140px]" />
          <Skeleton className="h-10 w-full sm:w-[150px]" />
        </div>

        {/* Table Skeleton */}
        <Card className="border-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[140px]" />
                      <Skeleton className="h-3 w-[180px]" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                    <Skeleton className="h-5 w-[120px]" />
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-5 w-[100px]" />
                    <Skeleton className="h-8 w-[100px] ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-full space-y-6 p-8 pt-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground">Manage your team members</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Card className="border-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-0">
          {isStoreLoading ? (
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[140px]" />
                        <Skeleton className="h-3 w-[180px]" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                      <Skeleton className="h-5 w-[120px]" />
                      <Skeleton className="h-6 w-[80px]" />
                      <Skeleton className="h-5 w-[100px]" />
                      <Skeleton className="h-8 w-[100px] ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[450px] items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredSalespersons.length === 0 ? (
            <div className="flex h-[450px] items-center justify-center">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No salespersons found
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSalespersons.map((person, index) => (
                    <TableRow
                      key={person.id || `salesperson-${index}`}
                      className="hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-border">
                            <span className="text-xs font-medium text-primary">
                              {person.first_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-medium">
                              {person.first_name} {person.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {person.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatPhoneNumber(person.phone)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            person.status === "active" ? "default" : "secondary"
                          }
                          className={
                            person.status === "active"
                              ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                              : "bg-muted hover:bg-muted/80"
                          }
                        >
                          {person.status.charAt(0).toUpperCase() +
                            person.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {new Date(person.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/salespersons/${person.id}`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openDeleteDialog(person)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Show first page, last page, and pages around current page
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNumber)}
                                isActive={pageNumber === currentPage}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }

                        // Show ellipsis for skipped pages
                        if (
                          (pageNumber === 2 && currentPage > 3) ||
                          (pageNumber === totalPages - 1 &&
                            currentPage < totalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={`ellipsis-${pageNumber}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}

          {/* Mobile View */}
          {!isStoreLoading && !error && filteredSalespersons.length > 0 && (
            <div className="block sm:hidden space-y-4">
              {currentSalespersons.map((person, index) => (
                <div
                  key={person.id || `salesperson-mobile-${index}`}
                  className="flex flex-col items-start gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-border">
                        <span className="text-xs font-medium text-primary">
                          {person.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-medium">
                          {person.first_name} {person.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {person.email}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/salespersons/${person.id}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => openDeleteDialog(person)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col items-start gap-3 w-full">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{person.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {new Date(person.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge
                      variant={
                        person.status === "active" ? "default" : "secondary"
                      }
                      className={
                        person.status === "active"
                          ? "w-fit bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                          : "w-fit bg-muted hover:bg-muted/80"
                      }
                    >
                      {person.status.charAt(0).toUpperCase() +
                        person.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Show first page, last page, and pages around current page
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={`mobile-${pageNumber}`}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNumber)}
                                isActive={pageNumber === currentPage}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }

                        // Show ellipsis for skipped pages
                        if (
                          (pageNumber === 2 && currentPage > 3) ||
                          (pageNumber === totalPages - 1 &&
                            currentPage < totalPages - 2)
                        ) {
                          return (
                            <PaginationItem
                              key={`mobile-ellipsis-${pageNumber}`}
                            >
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddSalespersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSalespersonAdded={fetchSalespersons}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingSalesperson?.first_name}{" "}
              {deletingSalesperson?.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSalesperson}
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

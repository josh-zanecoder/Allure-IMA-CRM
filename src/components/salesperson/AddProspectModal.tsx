"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog as ShadDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPhoneNumber } from "@/utils/formatters";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Interest,
  EducationLevel,
  Status,
  PreferredContactMethod,
  Student,
  Gender,
} from "@/types/prospect";
import { ProspectSchema } from "@/lib/validation/student-schema";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => void;
}

const initialFormState: Omit<Student, "id"> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
  },
  dateOfBirth: "",
  educationLevel: EducationLevel.HIGH_SCHOOL,
  interests: [],
  preferredContactMethod: PreferredContactMethod.EMAIL,
  notes: "",
  status: Status.New,
  fullName: "",
  lastContact: new Date().toISOString().split("T")[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  gender: Gender.MALE,
  genderOther: "",
  addedBy: {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  },
  assignedTo: {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  },
};

export default function AddStudentModal({
  isOpen,
  onClose,
  onSave,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [isInterestsDropdownOpen, setIsInterestsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving student...");

    try {
      // Validate the form data using Zod
      const validatedData = ProspectSchema.parse({
        ...formData,
        id: "temp-id", // Required by schema but not used in form
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: {
          id: "temp-id",
          firstName: "System",
          lastName: "User",
          email: "system@example.com",
          role: "admin",
        },
        assignedTo: {
          id: "temp-id",
          firstName: "System",
          lastName: "User",
          email: "system@example.com",
          role: "admin",
        },
      });

      await onSave(formData);
      setFormData(initialFormState);
      setErrors({});
      onClose();
      toast.success("Student added successfully", {
        id: loadingToast,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors", {
          id: loadingToast,
        });
      } else {
        toast.error("Failed to add student. Please try again.", {
          id: loadingToast,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
      // Clear error when user types
      setErrors((prev) => ({ ...prev, phone: "" }));
      return;
    }

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
      // Clear error when user types
      setErrors((prev) => ({ ...prev, [`address.${field}`]: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when user types
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setIsInterestsDropdownOpen(false);
    }
  }, [isOpen]);

  return (
    <ShadDialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new student to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                maxLength={14}
                className={cn(
                  "border-input",
                  (errors.phone ||
                    (formData.phone && !isValidPhoneNumber(formData.phone))) &&
                    "border-destructive"
                )}
              />
              {(errors.phone ||
                (formData.phone && !isValidPhoneNumber(formData.phone))) && (
                <p className="text-xs text-destructive">
                  {errors.phone ||
                    "Please enter a valid phone number in format (XXX) XXX-XXXX"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.street">Street Address</Label>
              <Input
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Enter street address"
                className={errors["address.street"] ? "border-destructive" : ""}
              />
              {errors["address.street"] && (
                <p className="text-xs text-destructive">
                  {errors["address.street"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.city">City</Label>
              <Input
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="Enter city"
                className={errors["address.city"] ? "border-destructive" : ""}
              />
              {errors["address.city"] && (
                <p className="text-xs text-destructive">
                  {errors["address.city"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.state">State</Label>
              <Input
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="Enter state"
                className={errors["address.state"] ? "border-destructive" : ""}
              />
              {errors["address.state"] && (
                <p className="text-xs text-destructive">
                  {errors["address.state"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.zip">ZIP Code</Label>
              <Input
                id="address.zip"
                name="address.zip"
                value={formData.address.zip}
                onChange={handleChange}
                placeholder="Enter ZIP code"
                className={errors["address.zip"] ? "border-destructive" : ""}
              />
              {errors["address.zip"] && (
                <p className="text-xs text-destructive">
                  {errors["address.zip"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? "border-destructive" : ""}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Education Level</Label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  errors.educationLevel && "border-destructive"
                )}
              >
                <option value="">Select education level</option>
                {Object.values(EducationLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.educationLevel && (
                <p className="text-xs text-destructive">
                  {errors.educationLevel}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <Popover
                open={isInterestsDropdownOpen}
                onOpenChange={setIsInterestsDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isInterestsDropdownOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {formData.interests.length > 0
                        ? formData.interests.join(", ")
                        : "Select interests..."}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search interests..." />
                    <CommandEmpty>No interest found.</CommandEmpty>
                    <CommandGroup>
                      {Object.values(Interest).map((interest) => (
                        <CommandItem
                          key={interest}
                          onSelect={() => handleInterestToggle(interest)}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={formData.interests.includes(interest)}
                            className="h-4 w-4"
                          />
                          {interest}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">
                Preferred Contact Method
              </Label>
              <select
                id="preferredContactMethod"
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  errors.preferredContactMethod && "border-destructive"
                )}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="text">Text Message</option>
              </select>
              {errors.preferredContactMethod && (
                <p className="text-xs text-destructive">
                  {errors.preferredContactMethod}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about the student"
                  className={errors.notes ? "border-destructive" : ""}
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    errors.status && "border-destructive"
                  )}
                >
                  {Object.values(Status).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </ShadDialog>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { formatPhoneNumber } from "@/utils/formatters";
import {
  Interest,
  EducationLevel,
  Status,
  Student,
  PreferredContactMethod,
  Gender,
} from "@/types/prospect";
import { ProspectSchema } from "@/lib/validation/student-schema";
import { useProspectStore } from "@/store/useProspectStore";
import { CalendarIcon } from "lucide-react";

// Add custom styles to hide date picker icon
const datePickerStyles = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    display: none !important;
    -webkit-appearance: none;
    opacity: 0;
  }
  input[type="date"]::-webkit-inner-spin-button,
  input[type="date"]::-webkit-clear-button {
    display: none;
    -webkit-appearance: none;
  }
`;

const initialFormState: Omit<Student, "id" | "createdAt" | "updatedAt"> = {
  firstName: "",
  lastName: "",
  email: "",
  gender: Gender.OTHER,
  genderOther: "",
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

export default function AddStudentPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createProspect, isLoading, error } = useProspectStore();
  const router = useRouter();
  const [maxDate, setMaxDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Calculate max date (14 years ago)
  useEffect(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 14);
    setMaxDate(today.toISOString().split("T")[0]);
  }, []);

  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const handleDateIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving student...");

    // Validate the form data first
    try {
      ProspectSchema.parse({
        ...formData,
        id: "temp-id",
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        toast.error("Please fill all the required fields", {
          id: loadingToast,
        });
        return;
      }
    }

    try {
      const result = await createProspect(formData);

      if (result) {
        setFormData(initialFormState);
        setErrors({});
        toast.success("Student added successfully", { id: loadingToast });
        router.push("/salesperson/prospects");
      } else {
        throw new Error(error || "Failed to create student");
      }
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create student",
        { id: loadingToast }
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
      setErrors((prev) => ({ ...prev, phone: "" }));
      return;
    }

    if (name === "gender") {
      // Clear genderOther if gender is not "Other"
      if (value !== Gender.OTHER) {
        setFormData((prev) => ({
          ...prev,
          gender: value as Gender,
          genderOther: "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          gender: value as Gender,
        }));
      }
      setErrors((prev) => ({ ...prev, gender: "", genderOther: "" }));
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
      setErrors((prev) => ({ ...prev, [`address.${field}`]: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="mb-5"
        >
          ← Back
        </Button>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details about the student.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.gender ? "border-destructive" : "border-input"
                }`}
              >
                <option value="">Select gender</option>
                {Object.values(Gender).map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
              {formData.gender === Gender.OTHER && (
                <div className="mt-2">
                  <Label htmlFor="genderOther" className="m-2">
                    Please specify
                  </Label>
                  <Input
                    id="genderOther"
                    name="genderOther"
                    value={formData.genderOther}
                    onChange={handleChange}
                    placeholder="Specify gender"
                    className={errors.genderOther ? "border-destructive" : ""}
                  />
                  {errors.genderOther && (
                    <p className="text-xs text-destructive">
                      {errors.genderOther}
                    </p>
                  )}
                </div>
              )}
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <style jsx global>
                  {datePickerStyles}
                </style>
                <div className="date-input-container flex w-full max-w-[180px] relative">
                  <Input
                    ref={dateInputRef}
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={maxDate}
                    className={`${
                      errors.dateOfBirth ? "border-destructive" : ""
                    } date-input pl-3 pr-10 w-full border border-input bg-transparent`}
                    style={{
                      colorScheme: "dark",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      appearance: "none",
                    }}
                    placeholder="mm/dd/yyyy"
                  />
                  <div
                    className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                    onClick={handleDateIconClick}
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {errors.dateOfBirth && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How can we reach the student?</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className={
                  errors.phone ||
                  (formData.phone && !isValidPhoneNumber(formData.phone))
                    ? "border-destructive"
                    : "border-input"
                }
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
              <Label htmlFor="preferredContactMethod">
                Preferred Contact Method
              </Label>
              <select
                id="preferredContactMethod"
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.preferredContactMethod
                    ? "border-destructive"
                    : "border-input"
                }`}
              >
                {Object.values(PreferredContactMethod).map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              {errors.preferredContactMethod && (
                <p className="text-xs text-destructive">
                  {errors.preferredContactMethod}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Info */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Where does the student live?</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Enter ZIP code (numbers only)"
                className={errors["address.zip"] ? "border-destructive" : ""}
              />
              {errors["address.zip"] && (
                <p className="text-xs text-destructive">
                  {errors["address.zip"]}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Education & Interests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Student's education background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="educationLevel">Education Level</Label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.educationLevel ? "border-destructive" : "border-input"
                }`}
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
              <CardDescription>
                What is the student interested in?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {Object.values(Interest).map((interest) => (
                  <Badge
                    key={interest}
                    variant={
                      formData.interests.includes(interest)
                        ? "secondary"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                    {formData.interests.includes(interest) && (
                      <span className="ml-1">×</span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Notes and status for this student.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.status ? "border-destructive" : "border-input"
                }`}
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
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="submit" disabled={isLoading} variant="default">
              {isLoading ? "Saving..." : "Save Student"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}

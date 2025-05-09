"use client";

import { useState, useEffect } from "react";
import {
  CreateSalespersonInput,
  CreateSalespersonInputSchema,
} from "@/types/salesperson";
import { formatPhoneNumber, unformatPhoneNumber } from "@/utils/formatters";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import axios from "axios";

interface AddSalespersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalespersonAdded?: () => void;
}

export default function AddSalespersonModal({
  isOpen,
  onClose,
  onSalespersonAdded,
}: AddSalespersonModalProps) {
  const [formData, setFormData] = useState<CreateSalespersonInput>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "Default@123",
    role: "salesperson",
    status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Function to check if phone number is valid
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "Default@123",
      role: "salesperson",
      status: "active",
    });
    setErrors({});
    setApiError(null);
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "phone"
  ) => {
    const { value } = e.target;
    const formattedValue = formatPhoneNumber(value);

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      handlePhoneChange(e, name as "phone");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    try {
      // Add enhanced validation rules
      if (formData.first_name.length < 2) {
        setErrors({ first_name: "First name must be at least 2 characters" });
        return false;
      }

      if (formData.last_name.length < 2) {
        setErrors({ last_name: "Last name must be at least 2 characters" });
        return false;
      }

      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setErrors({ email: "Please enter a valid email address" });
        return false;
      }

      // Check if phone has the complete and correct format
      if (!isValidPhoneNumber(formData.phone)) {
        setErrors({
          phone: "Please enter a valid phone number in format (XXX) XXX-XXXX",
        });
        return false;
      }

      // Validate the data with the schema
      CreateSalespersonInputSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into simple format
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0].toString();
          formattedErrors[field] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate form data
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating new member...");

    try {
      const response = await axios.post("/api/admin-salespersons/create", {
        ...formData,
        phone: unformatPhoneNumber(formData.phone),
      });

      console.log("response", response);

      // Send password setup email
      await sendSetPassword(formData.email);

      // Reset the form
      resetForm();

      if (onSalespersonAdded) {
        onSalespersonAdded();
      }

      toast.success("Member created successfully!", {
        id: loadingToast,
      });
      onClose();
    } catch (error) {
      console.error("Error creating member:", error);

      let errorMessage = "Failed to create member";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        id: loadingToast,
      });
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to send password setup email to newly created salesperson
  const sendSetPassword = async (email: string) => {
    try {
      await axios.post("/api/auth/send-password-setup", { email });
    } catch (error) {
      console.error("Error sending password setup email:", error);

      let errorMessage =
        "Failed to send password setup email. The member was created but will need to be sent a setup link manually.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 5000 });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Add a new member to your team. They'll receive login credentials via
            email.
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className={cn(errors.first_name && "border-destructive")}
              />
              {errors.first_name && (
                <p className="text-xs text-destructive">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className={cn(errors.last_name && "border-destructive")}
              />
              {errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
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

          <Alert>
            <AlertDescription>
              An email will be sent to the member's email with a{" "}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                Reset Password
              </code>
              button and link to set their own password.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

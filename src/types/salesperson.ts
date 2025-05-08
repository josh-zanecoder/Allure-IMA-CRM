import z from "zod";
export interface Salesperson {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  role: "salesperson";
  joinDate: string;
}

export const CreateSalespersonInputSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  password: z.string().min(8),
  status: z.enum(["active", "inactive"]),
  role: z.literal("salesperson"),
  twilio_number: z.string().optional(),
});

export type CreateSalespersonInput = z.infer<
  typeof CreateSalespersonInputSchema
>;

export interface UpdateSalespersonInput
  extends Partial<CreateSalespersonInput> {
  status?: "active" | "inactive";
}

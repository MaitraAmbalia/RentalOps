const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(32, "Password must not exceed 32 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[@$&_!#%*?^~.\-]/, "Must contain a special character (e.g. @, $, &, _, !)");

const registerVendorSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    companyProductCategory: z.string().min(2, "Company product category must be at least 2 characters"),
    gstNo: z.string().min(4, "GST number must be at least 4 characters"),
  })
  .refine((d) => !d.confirmPassword || d.password === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const registerClientSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number must be at least 7 characters"),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    shippingAddress: z.string().optional(),
    couponCode: z.string().optional(),
  })
  .refine((d) => !d.confirmPassword || d.password === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const vendorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const clientLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const deliveryLoginSchema = z.object({
  phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerVendorSchema,
  registerClientSchema,
  vendorLoginSchema,
  clientLoginSchema,
  deliveryLoginSchema,
};

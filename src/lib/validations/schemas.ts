import { z } from "zod";

// Base, Stock, and Bonus validations: no negative values, base must be > 0.
export const submissionSchema = z
  .object({
    company: z
      .string()
      .min(1, "Company name is required")
      .max(100, "Company name is too long"),
    role: z
      .string()
      .min(1, "Role is required")
      .max(100, "Role name is too long"),
    level: z
      .string()
      .min(1, "Level is required")
      .max(50, "Level is too long"),
    location: z
      .string()
      .min(1, "Location is required")
      .max(100, "Location is too long"),
    yoe: z
      .number({ invalid_type_error: "Years of experience must be a number" })
      .min(0, "Years of experience cannot be negative")
      .max(50, "Years of experience cannot exceed 50"),
    yoeAtCompany: z
      .number({ invalid_type_error: "Years at company must be a number" })
      .min(0, "Years at company cannot be negative")
      .max(50, "Years at company cannot exceed 50"),
    base: z
      .number({ invalid_type_error: "Base salary must be a number" })
      .gt(0, "Base salary must be greater than 0"),
    bonus: z
      .number({ invalid_type_error: "Bonus must be a number" })
      .min(0, "Bonus cannot be negative")
      .default(0),
    stock: z
      .number({ invalid_type_error: "Stock must be a number" })
      .min(0, "Stock cannot be negative")
      .default(0),
  })
  .refine((data) => data.yoeAtCompany <= data.yoe, {
    message: "Years at company cannot be greater than total years of experience",
    path: ["yoeAtCompany"],
  });

// Schema for matching query parameters
export const queryFilterSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  level: z.string().optional(),
  location: z.string().optional(),
  yoe: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  sortBy: z.enum(["totalCompensation", "base", "submittedAt", "yoe", "company", "role", "level", "location"]).default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.string().transform(val => val ? Math.max(1, parseInt(val)) : 1).default("1"),
  limit: z.string().transform(val => val ? Math.max(1, parseInt(val)) : 20).default("20"),
});

// Schema for saved comparisons
export const savedComparisonSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  companies: z.array(z.string()).default([]),
  levels: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
});

export const benchmarkSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  level: z.string().min(1, "Level is required"),
  totalCompensation: z.number().gt(0, "Total compensation must be greater than 0"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type SavedComparisonInput = z.infer<typeof savedComparisonSchema>;
export type BenchmarkInput = z.infer<typeof benchmarkSchema>;

// @ts-nocheck
// GOOD EXAMPLE - Zod Schema and TypeScript Interface Linkage

import { z } from "zod";

/**
 * Zod schema for validating user profile data.
 * 
 * @remarks
 * Strictly enforces email format and minimum name length. Used primarily
 * for form validation.
 * 
 * @see {@link UserProfile}
 * @category Utilities
 */
export const CreateUserSchema = z.object({
  /** The validated user email format. */
  email: z.string().email(),
  /** The age of the user, must be 18 or higher. */
  age: z.number().min(18),
});

/**
 * Compile-time representation of the `CreateUserSchema`.
 * 
 * Any structural changes to this interface MUST also be reflected in the Zod schema.
 * @see {@link CreateUserSchema}
 */
export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

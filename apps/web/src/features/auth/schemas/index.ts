import { z } from "zod";

export const signUpSchema = z
	.object({
		name: z.string().min(1, "Username is required"),
		email: z.email("Please enter a valid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(
				/[^A-Za-z0-9]/,
				"Password must contain at least one special character",
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["confirmPassword"],
				message: "Passwords do not match",
			});
		}
	});

export const signInSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;

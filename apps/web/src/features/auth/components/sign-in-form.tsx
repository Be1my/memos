import { Button } from "@memos/ui/components/button";
import { Field, FieldError, FieldLabel } from "@memos/ui/components/field";
import { Input } from "@memos/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";
import { type SignInValues, signInSchema } from "../schemas";

interface SignInFormProps {
	redirectPath?: string;
}

const defaultValues: SignInValues = {
	email: "",
	password: "",
};

export default function SignInForm({ redirectPath }: SignInFormProps) {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const form = useForm({
		defaultValues,
		validators: {
			onChange: signInSchema,
		},
		onSubmit: async ({ value }) => {
			setError(null);

			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({ to: redirectPath || "/home" });
					},
					onError: ({ error }) => {
						setError(error.message);
					},
				},
			);
		},
	});

	return (
		<form
			className="mt-2 w-full"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<div className="flex w-full flex-col items-start justify-start gap-4">
				<form.Field name="email">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>{m.common_email()}</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder={m.common_email()}
									autoComplete="email"
									autoCapitalize="off"
									spellCheck={false}
									required
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="password">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>
									{m.common_password()}
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder={m.common_password()}
									autoComplete="current-password"
									autoCapitalize="off"
									spellCheck={false}
									required
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
			</div>
			{error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
			<div className="mt-6 flex w-full flex-row items-center justify-end">
				<form.Subscribe
					selector={(state) => [state.isSubmitting, state.canSubmit]}
				>
					{([isSubmitting, canSubmit]) => (
						<Button
							type="submit"
							className="h-10 w-full"
							disabled={!canSubmit || isSubmitting}
						>
							{m.common_sign_in()}
							{isSubmitting && (
								<LoaderIcon className="ml-2 h-auto w-5 animate-spin opacity-60" />
							)}
						</Button>
					)}
				</form.Subscribe>
			</div>
			<div className="mt-4 flex w-full flex-row items-center justify-center">
				<p className="text-muted-foreground text-sm">
					{m.auth_sign_up_tip()}
					<Link
						to="/sign-up"
						className="ml-1 text-foreground underline underline-offset-2 hover:opacity-70"
					>
						{m.common_sign_up()}
					</Link>
				</p>
			</div>
		</form>
	);
}

export { default as AuthFooter } from "./components/auth-footer";
export { default as LocaleSelector } from "./components/locale-selector";
export { default as SignInForm } from "./components/sign-in-form";
export { default as SignUpForm } from "./components/sign-up-form";
export { default as ThemeSelector } from "./components/theme-selector";
export {
	firstUserQueryOptions,
	sessionQueryOptions,
} from "./queries/auth.query";
export type { SignInValues, SignUpValues } from "./schemas";
export { signInSchema, signUpSchema } from "./schemas";

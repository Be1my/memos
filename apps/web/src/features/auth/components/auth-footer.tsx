import { cn } from "@memos/ui/lib/utils";
import LocaleSelector from "./locale-selector";
import ThemeSelector from "./theme-selector";

interface Props {
	className?: string;
}

const AuthFooter = ({ className }: Props) => {
	return (
		<div
			className={cn(
				"mt-4 flex w-full flex-row items-center justify-center gap-2",
				className,
			)}
		>
			<LocaleSelector />
			<ThemeSelector />
		</div>
	);
};

export default AuthFooter;

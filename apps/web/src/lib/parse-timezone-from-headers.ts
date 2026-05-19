export function parseTimezoneFromHeaders(
	headers: { get(name: string): string | null },
): string {
	const cookieHeader = headers.get("cookie") || "";
	if (!cookieHeader.includes("memos-tz")) return "UTC";
	return cookieHeader.split("memos-tz=")[1]?.split(";")[0] || "UTC";
}

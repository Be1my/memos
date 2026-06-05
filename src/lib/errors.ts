export class ServerError extends Error {
	readonly code: string;
	readonly statusCode: number;

	constructor(message: string, code: string, statusCode = 500) {
		super(message);
		this.name = "ServerError";
		this.code = code;
		this.statusCode = statusCode;
	}
}

export class UnauthorizedError extends Error {
	constructor() {
		super("UNAUTHORIZED");
		this.name = "UnauthorizedError";
	}
}

export function unauthorized(message = "Not authenticated") {
	return new Response(null, {
		status: 302,
		headers: {
			Location: "/sign-in",
		},
	});
}

export function notFound(message = "Resource not found") {
	return new ServerError(message, "NOT_FOUND", 404);
}

export function badRequest(message: string) {
	return new ServerError(message, "BAD_REQUEST", 400);
}

export function internalError(message = "Internal server error") {
	return new ServerError(message, "INTERNAL_ERROR", 500);
}

export function jsonError(
	message: string,
	code: string,
	status: number,
): Response {
	return new Response(JSON.stringify({ error: message, code }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

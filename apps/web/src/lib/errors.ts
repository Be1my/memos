export class ServerError extends Error {
	readonly code: string;
	readonly statusCode: number;

	constructor(message: string, code: string, statusCode: number = 500) {
		super(message);
		this.name = "ServerError";
		this.code = code;
		this.statusCode = statusCode;
	}
}

export function unauthorized(message: string = "Not authenticated") {
	return new ServerError(message, "UNAUTHORIZED", 401);
}

export function notFound(message: string = "Resource not found") {
	return new ServerError(message, "NOT_FOUND", 404);
}

export function badRequest(message: string) {
	return new ServerError(message, "BAD_REQUEST", 400);
}

export function internalError(message: string = "Internal server error") {
	return new ServerError(message, "INTERNAL_ERROR", 500);
}

export function jsonError(message: string, code: string, status: number): Response {
	return new Response(JSON.stringify({ error: message, code }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

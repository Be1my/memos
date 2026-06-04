/* eslint-disable */
declare namespace Cloudflare {
	interface Env {
		DATABASE_URL: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
		CORS_ORIGIN: string;
		ALLOWED_HOSTS: string;
	}
}
interface Env extends Cloudflare.Env {}
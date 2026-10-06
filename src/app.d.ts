import type { UserDto } from '$lib/shared/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserDto | null;
			sessionId: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

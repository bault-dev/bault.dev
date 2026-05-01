"use server";

import { db } from "@/db";

export async function checkEmail(email: string) {
	try {
		const user = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, email),
			columns: {
				id: true,
			},
		});

		return { exists: !!user };
	} catch (error) {
		console.error("Error checking email:", error);
		return { exists: false };
	}
}

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
	const { nextUrl } = request;
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	const isAuthRoute =
		nextUrl.pathname.startsWith("/sign-in") ||
		nextUrl.pathname.startsWith("/sign-up");
	const isOnboardingRoute = nextUrl.pathname === "/onboarding";
	const isDashboardRoute =
		nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname === "/";

	if (!session) {
		if (isDashboardRoute || isOnboardingRoute) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	} else {
		if (isAuthRoute) {
			return NextResponse.redirect(new URL("/", request.url));
		}

		const hasActiveOrg = !!session.session.activeOrganizationId;

		if (!hasActiveOrg && !isOnboardingRoute && isDashboardRoute) {
			return NextResponse.redirect(new URL("/onboarding", request.url));
		}

		if (hasActiveOrg && isOnboardingRoute) {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/(files)/:path*", "/sign-in", "/sign-up", "/onboarding"],
};

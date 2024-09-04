import { authMiddleware } from "@clerk/nextjs/server";

const middlewareConfig = {
  publicRoutes: ['/'],
};

export default authMiddleware({
  // debug: true
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\.[\w]+$)", "/"]
};
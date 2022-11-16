import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Release date of internships webpage
const releaseDate = new Date("Sat, 19 Nov 2022 18:00:00 -0500");

export function middleware(_request: NextRequest) {
    if (process.env.NODE_ENV !== "production") return; 
    if (new Date().getTime() < releaseDate.getTime()) {
        return NextResponse.redirect(new URL("/", _request.nextUrl.origin));
    }  
}

export const config = {
    matcher: "/internships",
    runtime: 'experimental-edge'
}
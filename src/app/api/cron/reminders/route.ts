import { NextResponse } from "next/server";
import { checkReminders } from "@/actions/reminder";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
    // secure this route with a secret if deployed, for now open
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const result = await checkReminders();
    return NextResponse.json(result);
}

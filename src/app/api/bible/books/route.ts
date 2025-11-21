import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);


    const version = searchParams.get('version') || 'kjv';

    const response = await fetch(
        `http://localhost:5000/bible/books?version=${version}`
    );

    if (!response.ok) {
        return NextResponse.json({
            message: 'Verse not found or invalid input',
            status: 404,
        });
    }

    const data = await response.json();

    return NextResponse.json({
        message: 'success',
        status: 200,
        data,
    });
}

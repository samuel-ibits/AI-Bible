import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const book = searchParams.get('book');
    const version = searchParams.get('version') || 'kjv';



    console.log('Incoming query:', { book, });

    if (!book) {
        return NextResponse.json({
            message: 'Missing required query parameters',
            status: 400,
        });
    }

    const response = await fetch(
        `http://localhost:5000/bible/chapters?book=${book}&version=${version}`
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

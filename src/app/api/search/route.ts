import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const ranked = await fetch("http://localhost:5000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await ranked.json();
    return NextResponse.json({ message: "success", status: "200", data });
  } catch (error) {
    return NextResponse.json({
      message: 'Backend service unavailable',
      status: 503,
    }, { status: 503 });
  }
}



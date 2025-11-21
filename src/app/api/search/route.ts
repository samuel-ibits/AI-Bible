import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
  }


  // Step 1: Embed user query
  const ranked = await fetch("http://localhost:5000/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = (await ranked.json());
  return NextResponse.json({ 'message': "success", "status": "200", data },);
}



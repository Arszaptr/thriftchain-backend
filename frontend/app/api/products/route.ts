import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${API_URL}/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      throw new Error('Backend error');
    }

    const result = await backendResponse.json();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const backendResponse = await fetch(`${API_URL}/products/`);
    if (!backendResponse.ok) {
      throw new Error('Backend error');
    }
    const products = await backendResponse.json();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getMockCartData } from '@/lib/cartData';

export async function GET() {
  await new Promise((res) => setTimeout(res, 50));
  return NextResponse.json(getMockCartData());
}

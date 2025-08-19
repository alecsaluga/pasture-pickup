import { NextResponse } from 'next/server';
import { getPendingSubmissions } from '@/lib/airtable';

export async function GET() {
  try {
    const submissions = await getPendingSubmissions();
    
    return NextResponse.json(submissions, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error in admin submissions API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
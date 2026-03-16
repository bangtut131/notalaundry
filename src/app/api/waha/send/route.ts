import { NextResponse } from 'next/server';

const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3000/api/waha/mock'; // Default to mock

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;
    
    // Convert 08 to 628 for WA
    let waNumber = to.replace(/^0/, '62');
    waNumber = waNumber.replace(/[^0-9]/g, '');
    
    console.log(`[WAHA] Sending to ${waNumber}: \n${message}`);

    // If WAHA is properly configured, we send it here
    if (WAHA_URL.includes('localhost:3000/api/waha/mock')) {
      // Mock Success
      return NextResponse.json({ status: 'success', mock: true, sentTo: waNumber });
    } else {
      // Real WAHA request (assumes default session api structure)
      const res = await fetch(`${WAHA_URL}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          chatId: `${waNumber}@c.us`,
          text: message,
          session: 'default'
        })
      });
      
      const data = await res.json();
      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('WAHA Error:', error);
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}

// Mock Endpoint to prevent crash when WAHA isn't running
export async function PUT(req: Request) {
    return NextResponse.json({ status: 'mock_waha_received' });
}

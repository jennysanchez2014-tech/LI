import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Firebase is not initialized.' }, { status: 500 });
  }

  try {
    const adminKey = process.env.ADMIN_SECRET_KEY || '212096';
    if (!adminKey) {
      console.error('ADMIN_SECRET_KEY is not set.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin key.' }, { status: 401 });
    }

    const { clientId, days } = await req.json();

    if (!clientId || typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
      return NextResponse.json({ error: 'clientId and a positive integer for days are required' }, { status: 400 });
    }

    const docRef = db.collection('licenses').doc(clientId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }
    
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);

    await docRef.update({
      expiration_date: newExpiry,
      status: 'ACTIVA',
    });

    return NextResponse.json({ success: true, new_expiration_date: newExpiry.toISOString() });
  } catch (error) {
    console.error('Error extending license:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

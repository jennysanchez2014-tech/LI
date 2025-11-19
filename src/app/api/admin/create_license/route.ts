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

    const { clientId, expirationDate } = await req.json();

    if (!clientId || !expirationDate) {
      return NextResponse.json({ error: 'clientId and expirationDate are required' }, { status: 400 });
    }
    
    if (typeof clientId !== 'string' || clientId.trim() === '') {
        return NextResponse.json({ error: 'Invalid clientId format' }, { status: 400 });
    }

    const docRef = db.collection('licenses').doc(clientId);
    const doc = await docRef.get();

    if (doc.exists) {
      return NextResponse.json({ error: 'A license with this Client ID already exists' }, { status: 409 });
    }

    const newLicense = {
      status: 'ACTIVA',
      expiration_date: new Date(expirationDate),
    };

    await docRef.set(newLicense);

    return NextResponse.json({ success: true, message: `License for ${clientId} created successfully.` });
  } catch (error) {
    console.error('Error creating license:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

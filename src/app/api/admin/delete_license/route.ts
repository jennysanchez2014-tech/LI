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

    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const docRef = db.collection('licenses').doc(clientId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true, message: `License ${clientId} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting license:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

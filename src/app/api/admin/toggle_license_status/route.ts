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

    const { clientId, newStatus: requestedStatus } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const docRef = db.collection('licenses').doc(clientId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }
    
    const currentStatus = doc.data()?.status;
    let newStatus = '';

    if (requestedStatus) {
        // If a specific status is requested (like approving a pending license)
        if (['ACTIVA', 'BLOQUEADA'].includes(requestedStatus)) {
            newStatus = requestedStatus;
        } else {
            return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
        }
    } else {
        // Default toggle behavior
        newStatus = currentStatus === 'ACTIVA' ? 'BLOQUEADA' : 'ACTIVA';
    }


    await docRef.update({
      status: newStatus,
    });

    return NextResponse.json({ success: true, newStatus: newStatus });
  } catch (error) {
    console.error('Error toggling license status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

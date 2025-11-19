import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Firebase is not initialized. Check the server logs for more details.' }, { status: 500 });
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

    const licensesSnapshot = await db.collection('licenses').get();
    const licenses = licensesSnapshot.docs.map(doc => {
      const data = doc.data();
      
      let expirationDate = new Date(0).toISOString(); // Default to epoch time if invalid
      if (data.expiration_date && data.expiration_date instanceof Timestamp) {
        expirationDate = data.expiration_date.toDate().toISOString();
      }

      return {
        id: doc.id,
        status: data.status || 'UNKNOWN',
        expiration_date: expirationDate,
      };
    });

    return NextResponse.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

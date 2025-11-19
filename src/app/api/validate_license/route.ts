import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Firebase is not initialized.' }, { status: 500 });
  }

  try {
    const { clientId } = await req.json();

    if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
      return NextResponse.json({ error: 'A valid clientId is required' }, { status: 400 });
    }

    const docRef = db.collection('licenses').doc(clientId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // License not found, create a new license with PENDING status
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      const newLicense = {
        status: 'PENDIENTE', // New status for pending approval
        expiration_date: expirationDate,
        created_at: new Date(),
        last_seen: null,
      };

      await docRef.set(newLicense);

      // Return as invalid since it's pending approval
      return NextResponse.json({ valid: false, reason: 'License is pending approval' });
    }

    const data = doc.data();
    if (!data) {
        return NextResponse.json({ valid: false, reason: 'License data is invalid' });
    }

    if (data.status === 'BLOQUEADA') {
      return NextResponse.json({ valid: false, reason: 'License is blocked' });
    }

    if (data.status === 'PENDIENTE') {
      return NextResponse.json({ valid: false, reason: 'License is pending approval' });
    }

    if (data.status === 'EXPIRADA') {
        return NextResponse.json({ valid: false, reason: 'License has expired' });
    }

    const expirationDate = (data.expiration_date as Timestamp).toDate();
    if (expirationDate <= new Date()) {
      // Update status to EXPIRED in the database for consistency
      if (data.status !== 'EXPIRADA') {
          await docRef.update({ status: 'EXPIRADA' });
      }
      return NextResponse.json({ valid: false, reason: 'License has expired' });
    }

    // Only if status is ACTIVA and not expired
    if (data.status === 'ACTIVA') {
        // License is valid, update last seen timestamp asynchronously
        docRef.update({ last_seen: new Date() }).catch(err => console.error("Failed to update last_seen:", err));
        return NextResponse.json({ valid: true });
    }

    // Default to invalid for any other unhandled case
    return NextResponse.json({ valid: false, reason: 'License is not active' });
  } catch (error) {
    console.error('Error validating license:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

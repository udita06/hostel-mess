import { NextResponse } from 'next/server';
import { getDbStatus } from '../../../lib/mongodb';
import User from '../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getDbStatus();

  let userCount = 0;
  if (status.connected) {
    try {
      userCount = await User.countDocuments();
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    ...status,
    userCount,
    timestamp: new Date().toISOString(),
  });
}

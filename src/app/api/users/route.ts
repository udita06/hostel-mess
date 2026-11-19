import { NextResponse } from 'next/server';
import { INITIAL_USERS } from '../../../lib/constants';

export async function GET() {
  return NextResponse.json({
    users: INITIAL_USERS,
  });
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { INITIAL_USERS } from '../../../lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    let users = await User.find({}).sort({ year: 1, name: 1 }).lean();

    // If database is brand new and empty, seed it with initial hostel users
    if (!users || users.length === 0) {
      console.log('Seeding MongoDB with initial hostel residents and admin...');
      const seedDocs = INITIAL_USERS.map((u) => ({
        name: u.name,
        email: u.email.toLowerCase(),
        roomNumber: u.roomNumber,
        year: u.year,
        course: u.course,
        role: u.role,
        phone: u.phone || '',
      }));
      await User.insertMany(seedDocs);
      users = await User.find({}).sort({ year: 1, name: 1 }).lean();
    }

    // Map _id to id for seamless frontend usage
    const mappedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      roomNumber: u.roomNumber,
      year: u.year,
      course: u.course || 'B.Tech',
      role: u.role || 'student',
      phone: u.phone || '',
      createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      count: mappedUsers.length,
      users: mappedUsers,
    });
  } catch (err: any) {
    console.error('MongoDB users GET error, using fallback:', err.message);
    return NextResponse.json({
      success: false,
      source: 'memory_fallback',
      error: err.message,
      count: INITIAL_USERS.length,
      users: INITIAL_USERS,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, roomNumber, year, course, role, phone } = body;

    if (!name || !email || !roomNumber || !year) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: name, email, roomNumber, year',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `User with email "${cleanEmail}" already exists in MongoDB`,
        },
        { status: 409 }
      );
    }

    const created = await User.create({
      name: name.trim(),
      email: cleanEmail,
      roomNumber: roomNumber.trim(),
      year: Number(year),
      course: course || 'B.Tech',
      role: role || 'student',
      phone: phone || '',
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully in MongoDB',
      user: {
        id: created._id.toString(),
        name: created.name,
        email: created.email,
        roomNumber: created.roomNumber,
        year: created.year,
        course: created.course,
        role: created.role,
        phone: created.phone,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error('MongoDB users POST error:', err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, roomNumber, year, course, role, phone } = body;

    await connectToDatabase();

    const query = id ? { _id: id } : { email: email.toLowerCase() };
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (roomNumber) updates.roomNumber = roomNumber.trim();
    if (year !== undefined) updates.year = Number(year);
    if (course) updates.course = course;
    if (role) updates.role = role;
    if (phone !== undefined) updates.phone = phone;

    const updated = await User.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'User not found in MongoDB' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated in MongoDB',
      user: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        roomNumber: updated.roomNumber,
        year: updated.year,
        course: updated.course,
        role: updated.role,
        phone: updated.phone,
      },
    });
  } catch (err: any) {
    console.error('MongoDB users PUT error:', err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing user id parameter' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted from MongoDB successfully',
    });
  } catch (err: any) {
    console.error('MongoDB users DELETE error:', err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

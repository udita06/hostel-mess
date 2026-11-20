import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import MealPreference from '../../../models/MealPreference';
import { generateInitialMealPreferences } from '../../../lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const userId = searchParams.get('userId');

  try {
    await connectToDatabase();

    const query: any = {};
    if (date) query.date = date;
    if (userId) query.userId = userId;

    let meals = await MealPreference.find(query).lean();

    // If query was by date and no meals exist yet, we can return or seed
    const mappedMeals = meals.map((m: any) => ({
      id: m._id.toString(),
      userId: m.userId,
      userEmail: m.userEmail,
      date: m.date,
      lunch: m.lunch,
      dinner: m.dinner,
      updatedAt: m.updatedAt?.toISOString() || new Date().toISOString(),
      updatedBy: m.updatedBy || 'student',
      note: m.note || '',
    }));

    if (date) {
      const lunchVeg = mappedMeals.filter((m) => m.lunch === 'VEG').length;
      const lunchNonVeg = mappedMeals.filter((m) => m.lunch === 'NON_VEG').length;
      const dinnerVeg = mappedMeals.filter((m) => m.dinner === 'VEG').length;
      const dinnerNonVeg = mappedMeals.filter((m) => m.dinner === 'NON_VEG').length;

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        date,
        totalMeals: mappedMeals.length,
        lunch: { veg: lunchVeg, nonVeg: lunchNonVeg },
        dinner: { veg: dinnerVeg, nonVeg: dinnerNonVeg },
        preferences: mappedMeals,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      count: mappedMeals.length,
      meals: mappedMeals,
    });
  } catch (err: any) {
    console.error('MongoDB meals GET error, using fallback:', err.message);
    const allFallback = generateInitialMealPreferences();
    return NextResponse.json({
      success: false,
      source: 'fallback',
      count: allFallback.length,
      meals: allFallback,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userEmail, date, lunch, dinner, updatedBy, note } = body;

    if (!userId || !date) {
      return NextResponse.json(
        { success: false, message: 'Missing userId or date' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await MealPreference.findOneAndUpdate(
      { userId, date },
      {
        userId,
        userEmail: userEmail || 'unknown@hostel.edu',
        date,
        lunch: lunch || 'NONE',
        dinner: dinner || 'NONE',
        updatedBy: updatedBy || 'student',
        note: note || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Meal preference saved in MongoDB',
      preference: {
        id: updated._id.toString(),
        userId: updated.userId,
        date: updated.date,
        lunch: updated.lunch,
        dinner: updated.dinner,
        updatedAt: updated.updatedAt?.toISOString(),
        updatedBy: updated.updatedBy,
      },
    });
  } catch (err: any) {
    console.error('MongoDB meals POST error:', err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

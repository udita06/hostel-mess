import { NextResponse } from 'next/server';
import { generateInitialMealPreferences } from '../../../lib/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  const allMeals = generateInitialMealPreferences();
  
  if (date) {
    const filtered = allMeals.filter((m) => m.date === date);
    const lunchVeg = filtered.filter((m) => m.lunch === 'VEG').length;
    const lunchNonVeg = filtered.filter((m) => m.lunch === 'NON_VEG').length;
    const dinnerVeg = filtered.filter((m) => m.dinner === 'VEG').length;
    const dinnerNonVeg = filtered.filter((m) => m.dinner === 'NON_VEG').length;

    return NextResponse.json({
      date,
      totalMeals: filtered.length,
      lunch: { veg: lunchVeg, nonVeg: lunchNonVeg },
      dinner: { veg: dinnerVeg, nonVeg: dinnerNonVeg },
      preferences: filtered,
    });
  }

  return NextResponse.json({
    count: allMeals.length,
    meals: allMeals,
  });
}

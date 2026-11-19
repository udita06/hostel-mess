export type Role = 'admin' | 'student';

export type Year = 1 | 2 | 3 | 4;

export type Course = 'B.Tech' | 'M.Tech' | 'MCA';

export type MealChoice = 'VEG' | 'NON_VEG' | 'NONE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  year: Year;
  course: Course;
  roomNumber: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface MealPreference {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  lunch: MealChoice;
  dinner: MealChoice;
  updatedAt: string;
  updatedBy: 'student' | 'admin';
  note?: string;
}

export interface MealCutoffStatus {
  lunchLocked: boolean;
  dinnerLocked: boolean;
  lunchDeadline: Date;
  dinnerDeadline: Date;
  lunchDeadlineText: string;
  dinnerDeadlineText: string;
  lunchReason?: string;
  dinnerReason?: string;
}

export interface DayAggregatedStats {
  date: string;
  displayDate: string;
  lunchVeg: number;
  lunchNonVeg: number;
  lunchNone: number;
  dinnerVeg: number;
  dinnerNonVeg: number;
  dinnerNone: number;
  totalVeg: number;
  totalNonVeg: number;
  totalMarkedStudents: number;
}

export interface OverrideRequest {
  id: string;
  userId: string;
  userName: string;
  date: string;
  mealType: 'lunch' | 'dinner' | 'both';
  requestedLunch?: MealChoice;
  requestedDinner?: MealChoice;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

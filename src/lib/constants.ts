import { User, MealPreference } from '../types';

export const LUNCH_CUTOFF_HOUR = 22; // 10 PM on the day before
export const DINNER_CUTOFF_HOUR = 10; // 10 AM on the same day

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Dr. Suresh Sharma (Mess Warden)',
    email: 'admin@hostel.edu',
    role: 'admin',
    year: 4,
    course: 'B.Tech',
    roomNumber: 'W-01',
    phone: '+91 98765 43210',
    createdAt: '2026-01-01',
  },
  // 1st Year Students
  {
    id: 'usr_101',
    name: 'Aarav Mehta',
    email: 'aarav.m@hostel.edu',
    role: 'student',
    year: 1,
    course: 'B.Tech',
    roomNumber: 'A-101',
    phone: '+91 98111 22334',
    createdAt: '2026-08-01',
  },
  {
    id: 'usr_102',
    name: 'Diya Sen',
    email: 'diya.s@hostel.edu',
    role: 'student',
    year: 1,
    course: 'MCA',
    roomNumber: 'B-104',
    phone: '+91 98222 33445',
    createdAt: '2026-08-01',
  },
  {
    id: 'usr_103',
    name: 'Ishaan Verma',
    email: 'ishaan.v@hostel.edu',
    role: 'student',
    year: 1,
    course: 'B.Tech',
    roomNumber: 'A-108',
    phone: '+91 98333 44556',
    createdAt: '2026-08-01',
  },
  {
    id: 'usr_104',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@hostel.edu',
    role: 'student',
    year: 1,
    course: 'M.Tech',
    roomNumber: 'C-102',
    phone: '+91 98444 55667',
    createdAt: '2026-08-01',
  },

  // 2nd Year Students
  {
    id: 'usr_201',
    name: 'Rahul Sharma (You - Demo Student)',
    email: 'rahul.s@hostel.edu',
    role: 'student',
    year: 2,
    course: 'B.Tech',
    roomNumber: 'A-205',
    phone: '+91 98555 66778',
    createdAt: '2025-08-01',
  },
  {
    id: 'usr_202',
    name: 'Pooja Iyer',
    email: 'pooja.i@hostel.edu',
    role: 'student',
    year: 2,
    course: 'MCA',
    roomNumber: 'B-210',
    phone: '+91 98666 77889',
    createdAt: '2025-08-01',
  },
  {
    id: 'usr_203',
    name: 'Rohan Gupta',
    email: 'rohan.g@hostel.edu',
    role: 'student',
    year: 2,
    course: 'B.Tech',
    roomNumber: 'A-212',
    phone: '+91 98777 88990',
    createdAt: '2025-08-01',
  },
  {
    id: 'usr_204',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@hostel.edu',
    role: 'student',
    year: 2,
    course: 'M.Tech',
    roomNumber: 'C-204',
    phone: '+91 98888 99001',
    createdAt: '2025-08-01',
  },

  // 3rd Year Students
  {
    id: 'usr_301',
    name: 'Vikramaditya Roy',
    email: 'vikram.r@hostel.edu',
    role: 'student',
    year: 3,
    course: 'B.Tech',
    roomNumber: 'A-301',
    phone: '+91 97111 12345',
    createdAt: '2024-08-01',
  },
  {
    id: 'usr_302',
    name: 'Tanvi Nair',
    email: 'tanvi.n@hostel.edu',
    role: 'student',
    year: 3,
    course: 'MCA',
    roomNumber: 'B-305',
    phone: '+91 97222 23456',
    createdAt: '2024-08-01',
  },
  {
    id: 'usr_303',
    name: 'Aditya Prasad',
    email: 'aditya.p@hostel.edu',
    role: 'student',
    year: 3,
    course: 'B.Tech',
    roomNumber: 'A-315',
    phone: '+91 97333 34567',
    createdAt: '2024-08-01',
  },
  {
    id: 'usr_304',
    name: 'Meera Rao',
    email: 'meera.r@hostel.edu',
    role: 'student',
    year: 3,
    course: 'B.Tech',
    roomNumber: 'B-312',
    phone: '+91 97444 45678',
    createdAt: '2024-08-01',
  },

  // 4th Year Students
  {
    id: 'usr_401',
    name: 'Kunal Singhania',
    email: 'kunal.s@hostel.edu',
    role: 'student',
    year: 4,
    course: 'B.Tech',
    roomNumber: 'A-402',
    phone: '+91 96111 98765',
    createdAt: '2023-08-01',
  },
  {
    id: 'usr_402',
    name: 'Ritika Bannerjee',
    email: 'ritika.b@hostel.edu',
    role: 'student',
    year: 4,
    course: 'MCA',
    roomNumber: 'B-408',
    phone: '+91 96222 87654',
    createdAt: '2023-08-01',
  },
  {
    id: 'usr_403',
    name: 'Siddharth Joshi',
    email: 'siddharth.j@hostel.edu',
    role: 'student',
    year: 4,
    course: 'B.Tech',
    roomNumber: 'A-418',
    phone: '+91 96333 76543',
    createdAt: '2023-08-01',
  },
  {
    id: 'usr_404',
    name: 'Bhavna Chawla',
    email: 'bhavna.c@hostel.edu',
    role: 'student',
    year: 4,
    course: 'B.Tech',
    roomNumber: 'B-419',
    phone: '+91 96444 65432',
    createdAt: '2023-08-01',
  },
];

// Helper to generate seed meal preferences for next 30 days
export function generateInitialMealPreferences(): MealPreference[] {
  const preferences: MealPreference[] = [];
  const today = new Date();
  const students = INITIAL_USERS.filter((u) => u.role === 'student');

  // Generate 32 days (-1 day for yesterday, today, and 30 days ahead)
  for (let offset = -1; offset <= 30; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split('T')[0];

    students.forEach((student, sIdx) => {
      // Deterministic variety based on student and day
      const hash = (sIdx * 7 + offset * 3) % 10;
      let lunchChoice: 'VEG' | 'NON_VEG' | 'NONE' = 'VEG';
      let dinnerChoice: 'VEG' | 'NON_VEG' | 'NONE' = 'VEG';

      // Rahul (usr_201) has specific default preferences for testing
      if (student.id === 'usr_201') {
        lunchChoice = offset % 2 === 0 ? 'NON_VEG' : 'VEG';
        dinnerChoice = offset % 3 === 0 ? 'NON_VEG' : 'VEG';
      } else {
        if (hash === 1 || hash === 4 || hash === 7) {
          lunchChoice = 'NON_VEG';
        } else if (hash === 9) {
          lunchChoice = 'NONE';
        }

        if (hash === 2 || hash === 5 || hash === 8) {
          dinnerChoice = 'NON_VEG';
        } else if (hash === 0) {
          dinnerChoice = 'NONE';
        }
      }

      preferences.push({
        id: `pref_${student.id}_${dateStr}`,
        userId: student.id,
        date: dateStr,
        lunch: lunchChoice,
        dinner: dinnerChoice,
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        updatedBy: 'student',
      });
    });
  }

  return preferences;
}

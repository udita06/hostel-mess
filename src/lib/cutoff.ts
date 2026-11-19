import { MealCutoffStatus } from '../types';
import { LUNCH_CUTOFF_HOUR, DINNER_CUTOFF_HOUR } from './constants';

/**
 * Checks if lunch and dinner are frozen for a given meal date
 * based on current effective time (which can be real or simulated).
 * 
 * Rules:
 * - Lunch freeze: 10:00 PM (22:00) on the day before the meal date.
 * - Dinner freeze: 10:00 AM (10:00) on the same day as the meal date.
 */
export function getMealCutoffStatus(
  mealDateString: string,
  currentTime: Date = new Date(),
  isAdmin: boolean = false
): MealCutoffStatus {
  // Parse meal date (local date YYYY-MM-DD)
  const [year, month, day] = mealDateString.split('-').map(Number);
  
  // Lunch cutoff: Day before at 22:00:00
  const lunchDeadline = new Date(year, month - 1, day - 1, LUNCH_CUTOFF_HOUR, 0, 0, 0);
  
  // Dinner cutoff: Same day at 10:00:00
  const dinnerDeadline = new Date(year, month - 1, day, DINNER_CUTOFF_HOUR, 0, 0, 0);

  const lunchTimePassed = currentTime.getTime() >= lunchDeadline.getTime();
  const dinnerTimePassed = currentTime.getTime() >= dinnerDeadline.getTime();

  // If user is Admin, option is never frozen
  const lunchLocked = !isAdmin && lunchTimePassed;
  const dinnerLocked = !isAdmin && dinnerTimePassed;

  const formatDeadline = (d: Date) => {
    return d.toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return {
    lunchLocked,
    dinnerLocked,
    lunchDeadline,
    dinnerDeadline,
    lunchDeadlineText: `Cutoff: ${formatDeadline(lunchDeadline)}`,
    dinnerDeadlineText: `Cutoff: ${formatDeadline(dinnerDeadline)}`,
    lunchReason: lunchTimePassed
      ? 'Lunch preference frozen (passed 10:00 PM day before)'
      : 'Open for changes until 10:00 PM day before',
    dinnerReason: dinnerTimePassed
      ? 'Dinner preference frozen (passed 10:00 AM same day)'
      : 'Open for changes until 10:00 AM today',
  };
}

export function formatTimeRemaining(deadline: Date, currentTime: Date): string {
  const diffMs = deadline.getTime() - currentTime.getTime();
  if (diffMs <= 0) return 'Passed';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    return `${days}d ${diffHours % 24}h left`;
  }
  return `${diffHours}h ${diffMins}m left`;
}

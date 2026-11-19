import { User, MealPreference, OverrideRequest, MealChoice } from '../types';
import { INITIAL_USERS, generateInitialMealPreferences } from './constants';

const USERS_STORAGE_KEY = 'hostel_mess_users_v1';
const MEALS_STORAGE_KEY = 'hostel_mess_meals_v1';
const OVERRIDES_STORAGE_KEY = 'hostel_mess_overrides_v1';
const GFORM_CONFIG_KEY = 'hostel_mess_gform_config_v1';

export interface GFormConfig {
  formUrl: string;
  sheetCsvUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export const DEFAULT_GFORM_CONFIG: GFormConfig = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMessRegistrationFormDemo/viewform',
  sheetCsvUrl: '',
  autoSync: false,
};

export function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed reading users from localStorage', err);
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('hostel_users_updated'));
  } catch (err) {
    console.error('Failed saving users to localStorage', err);
  }
}

export function getStoredMealPreferences(): MealPreference[] {
  if (typeof window === 'undefined') return generateInitialMealPreferences();
  try {
    const data = localStorage.getItem(MEALS_STORAGE_KEY);
    if (!data) {
      const initial = generateInitialMealPreferences();
      localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed reading meals from localStorage', err);
    return generateInitialMealPreferences();
  }
}

export function saveStoredMealPreferences(prefs: MealPreference[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event('hostel_meals_updated'));
  } catch (err) {
    console.error('Failed saving meals to localStorage', err);
  }
}

export function getStoredOverrides(): OverrideRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredOverrides(overrides: OverrideRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event('hostel_overrides_updated'));
  } catch (err) {
    console.error('Failed saving overrides', err);
  }
}

export function getStoredGFormConfig(): GFormConfig {
  if (typeof window === 'undefined') return DEFAULT_GFORM_CONFIG;
  try {
    const data = localStorage.getItem(GFORM_CONFIG_KEY);
    return data ? { ...DEFAULT_GFORM_CONFIG, ...JSON.parse(data) } : DEFAULT_GFORM_CONFIG;
  } catch {
    return DEFAULT_GFORM_CONFIG;
  }
}

export function saveStoredGFormConfig(config: GFormConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GFORM_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed saving GForm config', err);
  }
}

export function resetAllDataToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  const newMeals = generateInitialMealPreferences();
  localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(newMeals));
  localStorage.removeItem(OVERRIDES_STORAGE_KEY);
  window.dispatchEvent(new Event('hostel_users_updated'));
  window.dispatchEvent(new Event('hostel_meals_updated'));
  window.dispatchEvent(new Event('hostel_overrides_updated'));
}

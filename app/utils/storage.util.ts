export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Profile {
  name: string;
  avatar?: string; // emoji or image URL
}

const CATEGORIES_STORAGE_KEY = 'categories';
const TAGS_STORAGE_KEY = 'tags';
const PROFILE_STORAGE_KEY = 'profile';

// Category utilities
export function getCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories:', error);
  }
}

export function addCategory(category: Omit<Category, 'id'>): Category {
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: Date.now().toString(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category | null {
  const categories = getCategories();
  const index = categories.findIndex(cat => cat.id === id);
  
  if (index === -1) return null;
  
  categories[index] = { ...categories[index], ...updates };
  saveCategories(categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter(cat => cat.id !== id);
  
  if (filtered.length === categories.length) return false;
  
  saveCategories(filtered);
  return true;
}

// Tag utilities
export function getTags(): Tag[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get tags:', error);
    return [];
  }
}

export function saveTags(tags: Tag[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error('Failed to save tags:', error);
  }
}

export function addTag(tag: Omit<Tag, 'id'>): Tag {
  const tags = getTags();
  const newTag: Tag = {
    ...tag,
    id: Date.now().toString(),
  };
  tags.push(newTag);
  saveTags(tags);
  return newTag;
}

export function updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>): Tag | null {
  const tags = getTags();
  const index = tags.findIndex(tag => tag.id === id);
  
  if (index === -1) return null;
  
  tags[index] = { ...tags[index], ...updates };
  saveTags(tags);
  return tags[index];
}

export function deleteTag(id: string): boolean {
  const tags = getTags();
  const filtered = tags.filter(tag => tag.id !== id);
  
  if (filtered.length === tags.length) return false;
  
  saveTags(filtered);
  return true;
}

// Profile utilities
export function getProfile(): Profile {
  if (typeof window === 'undefined') {
    return { name: 'User' };
  }
  
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { name: 'User' };
  } catch (error) {
    console.error('Failed to get profile:', error);
    return { name: 'User' };
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile:', error);
  }
}

export function updateProfile(updates: Partial<Profile>): Profile {
  const currentProfile = getProfile();
  const updatedProfile = { ...currentProfile, ...updates };
  saveProfile(updatedProfile);
  return updatedProfile;
}

// User session utilities
const USER_SESSION_KEY = 'user_session';

export interface UserSession {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export function getUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(USER_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[Storage Debug] Failed to get user session:', error);
    return null;
  }
}

export function saveUserSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('[Storage Debug] Saving user session:', { userId: session.lineUserId, displayName: session.displayName });
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    console.log('[Storage Debug] ✅ User session saved');
  } catch (error) {
    console.error('[Storage Debug] ❌ Failed to save user session:', error);
  }
}

export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('[Storage Debug] Clearing user session...');
    localStorage.removeItem(USER_SESSION_KEY);
    console.log('[Storage Debug] ✅ User session cleared');
  } catch (error) {
    console.error('[Storage Debug] ❌ Failed to clear user session:', error);
  }
}

export function isUserLoggedIn(): boolean {
  const session = getUserSession();
  return !!session;
}


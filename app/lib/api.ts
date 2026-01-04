// Server-side and client-side API helpers
import { User, Category, Tag, Transaction, TransactionStats, ApiError, TransactionType, TransactionStatus, Reminder, ReminderStatus, ReminderSettings } from './types';

/**
 * Get the base URL for API calls
 * On server-side, use absolute URL; on client-side, use relative URL
 */
function getApiUrl(path: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
  }
  // Client-side: use relative URL
  return path;
}

/**
 * Make an API request with x-line-user-id header
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit & { lineUserId: string }
): Promise<T> {
  const { lineUserId, ...fetchOptions } = options;
  
  const response = await fetch(getApiUrl(path), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'x-line-user-id': lineUserId,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    const error: ApiError = {
      error: errorData.error || `HTTP ${response.status}`,
      details: errorData.details,
    };
    throw error;
  }

  return response.json();
}

// ==================== User API ====================

export async function fetchCurrentUser(lineUserId: string): Promise<User> {
  const data = await apiRequest<{ user: User }>('/api/users/me', {
    method: 'GET',
    lineUserId,
  });
  return data.user;
}

// ==================== Category API ====================

export async function fetchCategories(lineUserId: string, type?: TransactionType): Promise<Category[]> {
  const path = type ? `/api/categories?type=${type}` : '/api/categories';
  const data = await apiRequest<{ categories: Category[] }>(path, {
    method: 'GET',
    lineUserId,
  });
  return data.categories;
}

export async function createCategory(
  lineUserId: string,
  payload: { name: string; type: TransactionType; emoji?: string; budget?: number }
): Promise<Category> {
  const data = await apiRequest<{ category: Category }>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.category;
}

export async function updateCategory(
  lineUserId: string,
  id: string,
  payload: { name?: string; type?: TransactionType; emoji?: string; budget?: number }
): Promise<Category> {
  const data = await apiRequest<{ category: Category }>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.category;
}

export async function deleteCategory(lineUserId: string, id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/categories/${id}`, {
    method: 'DELETE',
    lineUserId,
  });
}

// ==================== Tag API ====================

export async function fetchTags(lineUserId: string): Promise<Tag[]> {
  const data = await apiRequest<{ tags: Tag[] }>('/api/tags', {
    method: 'GET',
    lineUserId,
  });
  return data.tags;
}

export async function createTag(
  lineUserId: string,
  payload: { name: string }
): Promise<Tag> {
  const data = await apiRequest<{ tag: Tag }>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.tag;
}

export async function updateTag(
  lineUserId: string,
  id: string,
  payload: { name?: string }
): Promise<Tag> {
  const data = await apiRequest<{ tag: Tag }>(`/api/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.tag;
}

export async function deleteTag(lineUserId: string, id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/tags/${id}`, {
    method: 'DELETE',
    lineUserId,
  });
}

// ==================== Transaction API ====================

export interface FetchTransactionsParams {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  search?: string;
  categoryId?: string;
  tagIds?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export async function fetchTransactions(
  lineUserId: string,
  params?: FetchTransactionsParams
): Promise<Transaction[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
  if (params?.tagIds && params.tagIds.length > 0) searchParams.append('tagIds', params.tagIds.join(','));
  if (params?.minAmount !== undefined) searchParams.append('minAmount', params.minAmount.toString());
  if (params?.maxAmount !== undefined) searchParams.append('maxAmount', params.maxAmount.toString());

  const queryString = searchParams.toString();
  const path = `/api/transactions${queryString ? `?${queryString}` : ''}`;

  const data = await apiRequest<{ transactions: Transaction[] }>(path, {
    method: 'GET',
    lineUserId,
  });
  return data.transactions;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  date: string;
  name: string;
  categoryId?: string | null;
  tagIds?: string[];
  status?: TransactionStatus;
}

export async function createTransaction(
  lineUserId: string,
  payload: CreateTransactionPayload
): Promise<Transaction> {
  const data = await apiRequest<{ transaction: Transaction }>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.transaction;
}

export async function updateTransaction(
  lineUserId: string,
  id: string,
  payload: Partial<CreateTransactionPayload>
): Promise<Transaction> {
  const data = await apiRequest<{ transaction: Transaction }>(`/api/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.transaction;
}

export async function deleteTransaction(lineUserId: string, id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/transactions/${id}`, {
    method: 'DELETE',
    lineUserId,
  });
}

// ==================== Transaction Shortcuts API ====================

export interface TransactionShortcut {
  name: string;
  amount: number;
  categoryId: string | null;
  categoryName: string;
  categoryEmoji: string;
  type: TransactionType;
  count: number;
  lastUsed: string;
}

export async function fetchFrequentTransactions(lineUserId: string): Promise<{
  shortcuts: TransactionShortcut[];
  lastTransaction: Transaction | null;
}> {
  return apiRequest<{ shortcuts: TransactionShortcut[]; lastTransaction: Transaction | null }>(
    '/api/transactions/frequent',
    {
      method: 'GET',
      lineUserId,
    }
  );
}

// ==================== Transaction Stats API ====================

export interface FetchStatsParams {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
}

export async function fetchTransactionStats(
  lineUserId: string,
  params?: FetchStatsParams
): Promise<TransactionStats> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  if (params?.type) searchParams.append('type', params.type);

  const queryString = searchParams.toString();
  const path = `/api/transactions/stats${queryString ? `?${queryString}` : ''}`;

  const data = await apiRequest<{ stats: TransactionStats }>(path, {
    method: 'GET',
    lineUserId,
  });

  return data.stats;
}

// ==================== Reminder API ====================

export interface FetchRemindersParams {
  status?: ReminderStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export async function fetchReminders(
  lineUserId: string,
  params?: FetchRemindersParams
): Promise<Reminder[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const queryString = searchParams.toString();
  const path = `/api/reminders${queryString ? `?${queryString}` : ''}`;

  const data = await apiRequest<{ reminders: Reminder[] }>(path, {
    method: 'GET',
    lineUserId,
  });
  return data.reminders;
}

export interface CreateReminderPayload {
  title: string;
  note?: string | null;
  remindAt: string;
}

export async function createReminder(
  lineUserId: string,
  payload: CreateReminderPayload
): Promise<Reminder> {
  const data = await apiRequest<{ reminder: Reminder }>('/api/reminders', {
    method: 'POST',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.reminder;
}

export async function updateReminder(
  lineUserId: string,
  id: string,
  payload: Partial<CreateReminderPayload & { status: ReminderStatus }>
): Promise<Reminder> {
  const data = await apiRequest<{ reminder: Reminder }>(`/api/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.reminder;
}

export async function deleteReminder(lineUserId: string, id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/reminders/${id}`, {
    method: 'DELETE',
    lineUserId,
  });
}

// ==================== Reminder Settings API ====================

export async function getReminderSettings(lineUserId: string): Promise<ReminderSettings> {
  const data = await apiRequest<{ settings: ReminderSettings }>('/api/reminders/settings', {
    method: 'GET',
    lineUserId,
  });
  return data.settings;
}

export async function updateReminderSettings(
  lineUserId: string,
  payload: ReminderSettings
): Promise<ReminderSettings> {
  const data = await apiRequest<{ settings: ReminderSettings }>('/api/reminders/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
    lineUserId,
  });
  return data.settings;
}

// ==================== Export CSV API ====================

export interface ExportCsvParams {
  startDate: string; // ISO string
  endDate: string; // ISO string
  type?: TransactionType;
}

/**
 * Download transactions as CSV file
 * Returns the blob and filename for download
 */
export async function downloadTransactionsCsv(
  lineUserId: string,
  params: ExportCsvParams
): Promise<{ blob: Blob; filename: string }> {
  const searchParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (params.type) {
    searchParams.append('type', params.type);
  }

  const response = await fetch(getApiUrl(`/api/transactions/export?${searchParams.toString()}`), {
    headers: {
      'x-line-user-id': lineUserId,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    const error: ApiError = {
      error: errorData.error || `HTTP ${response.status}`,
      details: errorData.details,
    };
    throw error;
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'transactions.csv';

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  return { blob, filename };
}


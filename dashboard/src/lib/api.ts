/**
 * API通信ユーティリティ
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// ローカルストレージからAPIキーを取得
const getApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('apiKey');
};

// 共通リクエストヘッダー
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const apiKey = getApiKey();
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
  }
  return headers;
};

// APIレスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 型定義
export interface User {
  user_id: string;
  email: string;
  plan: string;
  plan_name: string;
  is_active: boolean;
  expires: string | null;
  api_key?: string;
}

export interface TrendItem {
  name: string;
  asin: string;
  category: string;
  current_rank: number;
  previous_rank: number | null;
  rank_change: number;
  rank_change_percent: number;
  price: number | null;
  affiliate_url: string;
}

export interface TrendsResponse {
  date: string;
  count: number;
  trends: TrendItem[];
}

export interface Plan {
  id: string;
  name: string;
  price_jpy: number;
  features: {
    daily_reports: number;
    categories: number;
    api_calls_per_day: number;
    realtime_alerts: boolean;
    custom_dashboard: boolean;
    export_formats: string[];
    support_level: string;
  };
}

// API関数
export const api = {
  // ユーザー登録
  async register(email: string): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.detail || 'Registration failed' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // 現在のユーザー情報取得
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        return { success: false, error: 'Not authenticated' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // トレンド取得
  async getTrends(limit = 20, category?: string): Promise<ApiResponse<TrendsResponse>> {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (category) params.append('category', category);

      const res = await fetch(`${API_BASE}/trends?${params}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.detail || 'Failed to fetch trends' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // カテゴリ別トレンド
  async getCategoryTrends(): Promise<ApiResponse<{ categories: Record<string, TrendItem[]> }>> {
    try {
      const res = await fetch(`${API_BASE}/trends/categories`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.detail || 'Failed to fetch category trends' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // プラン一覧取得
  async getPlans(): Promise<ApiResponse<{ plans: Plan[] }>> {
    try {
      const res = await fetch(`${API_BASE}/billing/plans`, {
        headers: getHeaders(false),
      });
      if (!res.ok) {
        return { success: false, error: 'Failed to fetch plans' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // プランアップグレード
  async upgradePlan(plan: string): Promise<ApiResponse<{ checkout_url: string }>> {
    try {
      const res = await fetch(`${API_BASE}/billing/upgrade`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          plan,
          success_url: `${window.location.origin}/dashboard?upgraded=true`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.detail || 'Failed to upgrade' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // サブスクリプションキャンセル
  async cancelSubscription(): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await fetch(`${API_BASE}/billing/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.detail || 'Failed to cancel' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};

// 認証ヘルパー
export const auth = {
  setApiKey(key: string) {
    localStorage.setItem('apiKey', key);
  },

  getApiKey(): string | null {
    return getApiKey();
  },

  clearApiKey() {
    localStorage.removeItem('apiKey');
  },

  isAuthenticated(): boolean {
    return !!getApiKey();
  },
};

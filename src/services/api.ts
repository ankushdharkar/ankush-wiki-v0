export const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

/** Authenticated fetch wrapper — prepends API_URL, includes credentials, and throws on non-OK responses. */
export async function apiAuthFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Shorthand for authenticated POST with JSON body. */
export function apiAuthPost<T>(path: string, body: unknown): Promise<T> {
  return apiAuthFetch<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface Question {
  id: number;
  content: string;
  isAnonymous: boolean;
  authorName: string;
  upvotes: number;
  upvotedBy: string[];
  aiAnswer: string | null;
  ankushAnswer: string | null;
  status: 'pending' | 'approved' | 'hidden';
  createdAt: string;
  // Topic fields
  topicSlug: string | null;
  topicName: string | null;
  topicColor: string | null;
  aiSummary: string | null;
}

export interface Topic {
  id: number;
  slug: string;
  name: string;
  color: string;
  description: string | null;
  count: number;
}

export interface CreateQuestionDto {
  content: string;
  isAnonymous: boolean;
  authorName: string;
}

export interface GetQuestionsParams {
  topic?: string;
  sort?: 'upvotes' | 'recent' | 'trending';
  limit?: number;
  offset?: number;
}

export const questionsApi = {
  async getAll(params?: GetQuestionsParams): Promise<Question[]> {
    const searchParams = new URLSearchParams();
    if (params?.topic) searchParams.set('topic', params.topic);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const queryString = searchParams.toString();
    return apiAuthFetch(`/questions${queryString ? `?${queryString}` : ''}`);
  },

  async getTopics(): Promise<Topic[]> {
    return apiAuthFetch('/questions/topics');
  },

  async create(dto: CreateQuestionDto): Promise<Question> {
    return apiAuthPost('/questions', dto);
  },

  async upvote(id: number, visitorId: string): Promise<Question> {
    return apiAuthPost(`/questions/${id}/upvote`, { visitorId });
  },
};

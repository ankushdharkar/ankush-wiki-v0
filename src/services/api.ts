const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3001';

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
    const url = `${API_URL}/questions${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async getTopics(): Promise<Topic[]> {
    const res = await fetch(`${API_URL}/questions/topics`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    return res.json();
  },

  async create(dto: CreateQuestionDto): Promise<Question> {
    const res = await fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to create question');
    return res.json();
  },

  async upvote(id: number, visitorId: string): Promise<Question> {
    const res = await fetch(`${API_URL}/questions/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    });
    if (!res.ok) throw new Error('Failed to upvote');
    return res.json();
  },
};

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
}

export interface CreateQuestionDto {
  content: string;
  isAnonymous: boolean;
  authorName: string;
}

export const questionsApi = {
  async getAll(): Promise<Question[]> {
    const res = await fetch(`${API_URL}/questions`);
    if (!res.ok) throw new Error('Failed to fetch questions');
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

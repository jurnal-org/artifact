export type FactType = "event" | "emotion" | "person" | "theme" | "insight";
export type FactStatus = "active" | "followed_up" | "expired";
export type MessageRole = "user" | "assistant";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  date: string;
  transcript: string | null;
  summary: string | null;
  mood_score: number | null;
  mood_keywords: string[];
  created_at: string;
}

export interface Fact {
  id: string;
  user_id: string;
  session_id: string;
  type: FactType;
  content: string;
  reference_date: string | null;
  tags: string[];
  status: FactStatus;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface SessionBriefing {
  todayFollowUps: Fact[];
  moodTrend: { date: string; mood_score: number; mood_keywords: string[] }[];
  correlatedFacts: Fact[];
}

export interface SessionClosure {
  summary: string;
  mood_score: number;
  mood_keywords: string[];
  facts: {
    type: FactType;
    content: string;
    reference_date: string | null;
    tags: string[];
  }[];
}

export interface AiResponse {
  message: string;
  session_complete: boolean;
}

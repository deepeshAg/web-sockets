// API types
export interface Poll {
  id: number;
  title: string;
  description?: string;
  option1: string;
  option2: string;
  option3?: string;
  option4?: string;
  creator_username?: string;
  votes: VoteStats;
  created_at: string;
  updated_at: string;
}

export interface VoteStats {
  option1: number;
  option2: number;
  option3: number;
  option4: number;
}

export interface CreatePollRequest {
  title: string;
  description?: string;
  option1: string;
  option2: string;
  option3?: string;
  option4?: string;
  creator_username?: string;
}

export interface VoteRequest {
  option: number;
  voter_username?: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  votes: VoteStats;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  likes_count: number;
}

export interface WebSocketMessage {
  type: 'vote_update' | 'like_update' | 'poll_created' | 'poll_deleted' | 'user_like_update' | 'like_toggle_update';
  poll_id: number;
  data: any;
}

// API client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // If we can't parse the error response, use the status text
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Poll endpoints
  async createPoll(poll: CreatePollRequest): Promise<Poll> {
    return this.request<Poll>('/polls/', {
      method: 'POST',
      body: JSON.stringify(poll),
    });
  }

  async getPolls(): Promise<Poll[]> {
    const response = await this.request<{ polls: Poll[] }>('/polls/');
    return response.polls;
  }

  async getPoll(id: number): Promise<Poll> {
    return this.request<Poll>(`/polls/${id}`);
  }

  async deletePoll(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/polls/${id}`, {
      method: 'DELETE',
    });
  }

  // Vote endpoints
  async voteOnPoll(pollId: number, vote: VoteRequest): Promise<VoteResponse> {
    return this.request<VoteResponse>(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify(vote),
    });
  }

  async resetPollVotes(pollId: number): Promise<{ message: string; votes: VoteStats }> {
    return this.request<{ message: string; votes: VoteStats }>(`/polls/${pollId}/reset-votes`, {
      method: 'POST',
    });
  }

  // User like methods
  async likeUser(userLike: UserLikeRequest): Promise<UserLikeResponse> {
    return this.request<UserLikeResponse>('/users/like', {
      method: 'POST',
      body: JSON.stringify(userLike),
    });
  }

  async unlikeUser(userLike: UserLikeRequest): Promise<UserLikeResponse> {
    return this.request<UserLikeResponse>('/users/like', {
      method: 'DELETE',
      body: JSON.stringify(userLike),
    });
  }

  async getUserProfile(username: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${username}/profile`);
  }

  async getUserLikes(username: string): Promise<{ username: string; likes_count: number }> {
    return this.request<{ username: string; likes_count: number }>(`/users/${username}/likes`);
  }

  async getUserLikesGiven(username: string): Promise<{ username: string; liked_users: string[] }> {
    return this.request<{ username: string; liked_users: string[] }>(`/users/${username}/likes-given`);
  }

  async getPollVoters(pollId: number): Promise<PollVotersResponse> {
    return this.request<PollVotersResponse>(`/polls/${pollId}/voters`);
  }
}

export interface UserLikeRequest {
  liker_username: string;
  liked_username: string;
  poll_id?: number;
}

export interface UserLikeResponse {
  success: boolean;
  message: string;
  likes_count: number;
}

export interface UserProfile {
  username: string;
  likes_received: number;
  polls_created: number;
  total_votes: number;
}

export interface VoterInfo {
  username?: string;
  voted_at: string;
}

export interface PollVotersResponse {
  poll_id: number;
  option1_voters: VoterInfo[];
  option2_voters: VoterInfo[];
  option3_voters: VoterInfo[];
  option4_voters: VoterInfo[];
}

export const apiClient = new ApiClient();
export { API_BASE_URL, WS_BASE_URL };

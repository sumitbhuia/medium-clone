// frontend/src/api.ts
import { supabase } from "./supabaseClient";
import {
  UserProfile,
  Post,
  UpdateUserProfilePayload,
  CreateCommentPayload,
  Comment,
} from "./types";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || process.env.REACT_APP_BASE_URL;

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    // Handle case where there is no access token, perhaps redirect to login
    // For now, we'll throw an error or return headers that might lead to a 401
    console.warn("No access token found for API request.");
  }

  return {
    Authorization: `Bearer ${accessToken || ""}`,
    "Content-Type": "application/json",
  };
};

const handleApiError = async (response: Response) => {
  // If status is 401 or 403, redirect to sign-in page for re-authentication.
  if (response.status === 401 || response.status === 403) {
    window.location.href = "/signin";
    return new Promise(() => {});
  }
  // For other errors (e.g., 404 Not Found, 500 Server Error), throw the error into the UI
  const errorResult = await response
    .json()
    .catch(() => ({
      error: `An unknown error occurred (status: ${response.status})`,
    }));
  throw new Error(errorResult.error || "An unexpected error occurred.");
};

export const api = {

   async toggleClap(postId: number): Promise<{ isClapped: boolean; clapCount: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/stats/clap/${postId}`, {
      method: "POST",
      headers,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.data; // The backend already returns { data: { isClapped, clapCount } }
  },

  async toggleBookmark(postId: number): Promise<{ isBookmarked: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/stats/bookmark/${postId}`, {
      method: "POST",
      headers,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.data; // The backend already returns { data: { isBookmarked } }
  },

  async toggleFollow(username: string): Promise<{ isFollowing: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/follow/${username}`, {
      method: "POST",
      headers,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.data;
  },

  async getMe(): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/me`, { headers });
    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.data;
  },

  async getUserProfile(username: string): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/${username}`, {
      headers,
    });
    if (!response.ok) {
      const errorResult = await response
        .json()
        .catch(() => ({ error: "Failed to fetch user profile" }));
      throw new Error(errorResult.error || "Failed to fetch user profile");
    }
    const result = await response.json();
    return result.data;
  },

  async updateUserProfile(
    payload: UpdateUserProfilePayload
  ): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.data;
  },

  async getPostById(postId: number): Promise<Post> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/blog/${postId}`, {
      headers,
    });

    const result = await response.json();

    if (!response.ok)
      throw new Error(result.error || "Failed to fetch blog post");

    return result.data;
  },

  async getAllPost(): Promise<Post[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/blog/allPosts`, {
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch posts");
    }

    return result.data;
  },

  async getUserPosts(
    username: string,
    page: number = 1
  ): Promise<{ data: Post[]; pagination: any }> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/user/${username}/posts?page=${page}&limit=10`,
      {
        headers,
      }
    );
    if (!response.ok) {
      const errorResult = await response
        .json()
        .catch(() => ({ error: "Failed to fetch user posts" }));
      throw new Error(errorResult.error || "Failed to fetch user posts");
    }
    return await response.json();
  },

  async editPostById(
    postId: number,
    title: string,
    description: string
  ): Promise<Post> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/blog/edit/${postId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        title,
        description,
      }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.data;
  },

  async createPost(title: string, description: string): Promise<Post> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/blog/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title,
        description,
        published: true,
      }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.data;
  },

  async canEditPost(postId: number): Promise<Boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/blog/can-edit-post?postId=${postId}&userId=${session?.user.id}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result.isOwner;
  },

  async getUserBookmarks(page: number = 1): Promise<{ data: Post[], pagination: any }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/stats/bookmarks?page=${page}&limit=10`, {
      headers,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const result = await response.json();
    return result;
  },



  // Comment-related API calls
  async getPostComments(
    postId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<Comment[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/comments/${postId}?page=${page}&limit=${limit}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      const errorResult = await response
        .json()
        .catch(() => ({ error: "Failed to fetch comments" }));
      throw new Error(errorResult.error || "Failed to fetch comments");
    }
    return await response.json();
  },

  async addComment(
    postId: number,
    payload: CreateCommentPayload
  ): Promise<Comment> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/stats/comment/${postId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorResult = await response
        .json()
        .catch(() => ({ error: "Failed to add comment" }));
      throw new Error(errorResult.error || "Failed to add comment");
    }
    const result = await response.json();
    return result.data;
  },

  //#TODO change the payload type
  async updateComment(
    commentId: number,
    payload: CreateCommentPayload
  ): Promise<Comment> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/comment/${commentId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      const errorResult = await response
        .json()
        .catch(() => ({ error: "Failed to update comment" }));
      throw new Error(errorResult.error || "Failed to update comment");
    }
    const result = await response.json();
    return result.data;
  },

  async deleteComment(commentId: number): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/comment/${commentId}`,
      {
        method: "DELETE",
        headers,
      }
    );
    if (!response.ok) {
      const errorResult = await response
        .json()
        .catch(() => ({ error: "Failed to delete comment" }));
      throw new Error(errorResult.error || "Failed to delete comment");
    }
  },
};

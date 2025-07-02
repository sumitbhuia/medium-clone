import { supabase } from "./supabaseClient";
import { UserProfile, Post, UpdateUserProfilePayload } from "./types"; // Assuming User type is also in types.ts

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

export const api = {
  async getMe(): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/me`, {
      headers,
    });
    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ error: "Failed to fetch user profile" }));
      throw new Error(errorResult.error || "Failed to fetch user profile");
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
      const errorResult = await response.json().catch(() => ({ error: "Failed to fetch user profile" }));
      throw new Error(errorResult.error || "Failed to fetch user profile");
    }
    const result = await response.json();
    return result.data;
  },

  async updateUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const result = await response.json(); // Try to parse JSON regardless of response.ok
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update profile');
    }
    return result.data;
  },

  async getPostById(postId: string): Promise<Post> {
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
       const errorResult = await response.json().catch(() => ({ error: "Failed to fetch user posts" }));
      throw new Error(errorResult.error || "Failed to fetch user posts");
    }
    return await response.json();
  },

  async editPostById(
    postId: string,
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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update blog post");
    }

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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to publish post");
    }

    return result.data;
  },

  async canEditPost(postId: string): Promise<Boolean> {
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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to check edit permission");
    }

    return result.isOwner;
  },

  async toggleFollow(username: string): Promise<{ isFollowing: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/follow/${username}`, {
      method: "POST",
      headers,
    });
     if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ error: "Failed to toggle follow" }));
      throw new Error(errorResult.error || "Failed to toggle follow");
    }
    const result = await response.json();
    return result.data;
  },

  async toggleClap(postId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/clap/${postId}`,
      {
        method: "POST",
        headers,
      }
    );
    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ error: "Failed to toggle clap" }));
      throw new Error(errorResult.error || "Failed to toggle clap");
    }
  },

  async toggleBookmark(postId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/bookmark/${postId}`,
      {
        method: "POST",
        headers,
      }
    );
     if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ error: "Failed to toggle bookmark" }));
      throw new Error(errorResult.error || "Failed to toggle bookmark");
    }
  },
};

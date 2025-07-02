import { Context } from "hono";
import { getPrisma } from "../lib/prisma";

enum StatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// Get current authenticated user's profile
export async function getMe(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    // Get current authenticated user ID from auth middleware
    const currentUserId = c.get("userId");

    // Check if user is authenticated
    if (!currentUserId) {
      return c.json(
        { error: "Authentication required" },
        StatusCodes.UNAUTHORIZED
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        location: true,
        website: true,
        email: true, // Include email for current user
        createdAt: true,
        _count: {
          select: {
            posts: { where: { published: true } },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    // Format response - include more details for own profile
    const userProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      bio: user.bio || "",
      avatar:
        user.avatar ||
        `https://api.dicebear.com/9.x/thumbs/svg?seed=Andrea`,
      coverImage: user.coverImage,
      location: user.location,
      website: user.website,
      email: user.email, // Only show email for own profile
      joinedDate: user.createdAt.toISOString(),
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
    };

    return c.json({ data: userProfile }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return c.json(
      { error: "Failed to fetch user profile" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Get user profile by username
export async function getUserProfile(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const username = c.req.param("username");

    // Get current user ID if authenticated (set by optionalAuth middleware)
    const currentUserId = c.get("userId");

    console.log("from userController", currentUserId, username);

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { published: true } },
            followers: true,
            following: true,
          },
        },
        followers: currentUserId
          ? {
              where: { followerId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    // Format response
    const userProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      bio: user.bio || "",
      avatar:
        user.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`,
      coverImage: user.coverImage,
      location: user.location,
      website: user.website,
      joinedDate: user.createdAt.toISOString(),
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
      isFollowing: currentUserId ? user.followers.length > 0 : false,
      isOwnProfile: currentUserId === user.id,
    };

    return c.json({ data: userProfile }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json(
      { error: "Failed to fetch user profile" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Get user's posts
export async function getUserPosts(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const username = c.req.param("username");
    const currentUserId = c.get("userId");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;

    // First get the user
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    // Get posts
    const posts = await prisma.post.findMany({
      where: {
        userId: user.id,
        published: true,
      },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
            bookmarks: true,
          },
        },
        claps: currentUserId
          ? {
              where: { userId: currentUserId },
            }
          : false,
        bookmarks: currentUserId
          ? {
              where: { userId: currentUserId },
            }
          : false,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    });

    // Format posts for frontend
    const formattedPosts = posts.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString(),
      readTime:
        post.readTime ||
        Math.ceil(
          post.description.replace(/<[^>]+>/g, "").split(/\s+/).length / 225
        ),
      imageUrl: post.imageUrl,

      User: {
        username: post.author.username,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      clapCount: post._count.claps,
      responseCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      isClapped: currentUserId ? post.claps.length > 0 : false,
      isBookmarked: currentUserId ? post.bookmarks.length > 0 : false,
      tags: post.tags.map((pt) => pt.tag.name),
    }));

    return c.json(
      {
        data: formattedPosts,
        pagination: {
          page,
          limit,
          hasMore: posts.length === limit,
        },
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return c.json(
      { error: "Failed to fetch user posts" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Update user profile
export async function updateUserProfile(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const {
      displayName,
      bio,
      avatar,
      coverImage,
      location,
      website,
      username,
    } = body;

    // Check if username is taken (if being updated)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return c.json(
          { error: "Username already taken" },
          StatusCodes.CONFLICT
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(coverImage !== undefined && { coverImage }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(username !== undefined && { username }),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        location: true,
        website: true,
        email: true,
      },
    });

    return c.json({ data: updatedUser }, StatusCodes.OK);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return c.json(
      { error: "Failed to update profile" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Follow/Unfollow user
export async function toggleFollow(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const followerId = c.get("userId");
    const followingUsername = c.req.param("username");

    // Get the user to follow
    const userToFollow = await prisma.user.findUnique({
      where: { username: followingUsername },
      select: { id: true },
    });

    if (!userToFollow) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    if (followerId === userToFollow.id) {
      return c.json(
        { error: "Cannot follow yourself" },
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userToFollow.id,
        },
      },
    });

    let isFollowing: boolean;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId: userToFollow.id,
        },
      });
      isFollowing = true;
    }

    return c.json(
      {
        data: { isFollowing },
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error toggling follow:", error);
    return c.json(
      { error: "Failed to toggle follow" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Get user's followers
export async function getUserFollowers(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const username = c.req.param("username");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            avatar: true,
            _count: {
              select: {
                followers: true,
                posts: { where: { published: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const formattedFollowers = followers.map((f) => ({
      id: f.follower.id,
      username: f.follower.username,
      displayName: f.follower.displayName || f.follower.username,
      bio: f.follower.bio,
      avatar:
        f.follower.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${f.follower.username}`,
      followersCount: f.follower._count.followers,
      postsCount: f.follower._count.posts,
    }));

    return c.json(
      {
        data: formattedFollowers,
        pagination: {
          page,
          limit,
          hasMore: followers.length === limit,
        },
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error fetching followers:", error);
    return c.json(
      { error: "Failed to fetch followers" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Get user's following
export async function getUserFollowing(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const username = c.req.param("username");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            avatar: true,
            _count: {
              select: {
                followers: true,
                posts: { where: { published: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const formattedFollowing = following.map((f) => ({
      id: f.following.id,
      username: f.following.username,
      displayName: f.following.displayName || f.following.username,
      bio: f.following.bio,
      avatar:
        f.following.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${f.following.username}`,
      followersCount: f.following._count.followers,
      postsCount: f.following._count.posts,
    }));

    return c.json(
      {
        data: formattedFollowing,
        pagination: {
          page,
          limit,
          hasMore: following.length === limit,
        },
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error fetching following:", error);
    return c.json(
      { error: "Failed to fetch following" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Create/Update user (for Supabase auth integration)
export async function upsertUser(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const body = await c.req.json();
    const { id, email, username } = body;

    if (!id || !email) {
      return c.json(
        { error: "Missing required fields" },
        StatusCodes.BAD_REQUEST
      );
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        ...(username && { username }),
      },
      create: {
        id,
        email,
        username: username || email.split("@")[0], // Fallback username
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
      },
    });

    return c.json({ data: user }, StatusCodes.OK);
  } catch (error) {
    console.error("Error upserting user:", error);
    return c.json(
      { error: "Failed to create/update user" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

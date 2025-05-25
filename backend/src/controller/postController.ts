import { Context } from "hono";
import { getPrisma } from "../lib/prisma";
import {
  postInputSchema,
  updatePostInputSchema,
} from "@sumitbhuia/medium_common";

// Define a custom context type to include userId as a string

enum StatusCodes {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export async function getAllPosts(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const allPosts = await prisma.post.findMany({
      where: { published: true }, // Only fetch published posts
      include: {
        User: {
          select: { username: true, email: true }, // Only include necessary fields
        },
      },
    });

    return c.json({ data: allPosts }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return c.json(
      { error: "Failed to fetch posts" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function createPost(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const body = await c.req.json();
    const parsedPost = postInputSchema.safeParse(body);

    if (!parsedPost.success) {
      return c.json({ error: "Invalid post input" }, StatusCodes.BAD_REQUEST);
    }

    const { title, description } = parsedPost.data;
    const userId = c.get("userId"); // userId is a string (UUID)

    const newPost = await prisma.post.create({
      data: {
        title,
        description,
        userId,
        published: true, // Set to true by default; adjust if drafts are needed
      },
      include: {
        User: {
          select: { username: true, email: true },
        },
      },
    });

    return c.json({ data: newPost }, StatusCodes.OK);
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json(
      { error: "Failed to create post" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function getPostById(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const pid = Number(c.req.param("id"));
    if (isNaN(pid) || pid <= 0) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

    const post = await prisma.post.findUnique({
      where: {
        id: pid,
      },
      include: {
        User: {
          select: { username: true, email: true },
        },
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, StatusCodes.NOT_FOUND);
    }

    // Optionally, restrict access to unpublished posts
    if (!post.published) {
      const userId = c.get("userId");
      if (post.userId !== userId) {
        return c.json(
          { error: "Unauthorized: Cannot access unpublished post" },
          StatusCodes.UNAUTHORIZED
        );
      }
    }

    return c.json({ data: post }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return c.json(
      { error: "Failed to fetch post" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function updatePostById(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id) || id <= 0) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

    const body = await c.req.json();
    const parsedPost = updatePostInputSchema.safeParse({ ...body, id });
    if (!parsedPost.success) {
      return c.json({ error: "Invalid post input" }, StatusCodes.BAD_REQUEST);
    }

    const { title, description } = parsedPost.data;
    const userId = c.get("userId");

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!post) {
      return c.json(
        { error: "Post not found or you are not authorized to update it" },
        StatusCodes.NOT_FOUND
      );
    }

    const updatedPost = await prisma.post.update({
      where: {
        id,
        userId,
      },
      data: {
        title,
        description,
      },
      include: {
        User: {
          select: { username: true, email: true },
        },
      },
    });

    return c.json({ data: updatedPost }, StatusCodes.OK);
  } catch (error) {
    console.error("Error updating post by ID:", error);
    return c.json(
      { error: "Failed to update post" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}



export async function getPostOwner(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    // Parse query parameters
    const { postId, userId } = c.req.query();

    // Validate query parameters
    if (!postId || !userId) {
      return c.json(
        { error: "Missing postId or userId in query parameters" },
        StatusCodes.BAD_REQUEST
      );
    }



    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, StatusCodes.NOT_FOUND);
    }

    const isOwner = post.userId === userId;

    return c.json({ isOwner }, StatusCodes.OK);
  } catch (error) {
    console.error("Error in getPostOwner:", error);
    return c.json(
      { error: "Internal server error" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
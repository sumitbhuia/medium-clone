import { Context } from "hono";
import { getPrisma } from "../lib/prisma";
import {
  postInputSchema,
  updatePostInputSchema,
} from "@sumitbhuia/medium_common";

enum StatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

import { TagGen } from "../lib/tagGen";


export async function createPost(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const aiTagService = new TagGen(c.env.GEMINI_API_KEY);

  try {
    const body = await c.req.json();
    const parsedPost = postInputSchema.safeParse(body);

    if (!parsedPost.success) {
      return c.json(
        {
          error: "Invalid post input",
          details: parsedPost.error.errors,
        },
        StatusCodes.BAD_REQUEST
      );
    }

    const {
      title,
      description,
      imageUrl,
      published,
      tagIds,
    } = parsedPost.data;
    const userId = c.get("userId");

    console.log("tags -> ",tagIds);

    const calculateReadTime = (htmlContent: string) => {
      const wordCount = htmlContent
        .replace(/<[^>]+>/g, '') // Strip HTML tags
        .replace(/\[[0-9]+\]/g, '') // Remove citations
        .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
        .split(/\s+/).length;
      return Math.ceil(wordCount / 225); // 225 wpm
    };

    const readTime = calculateReadTime(description);

    // Generate AI tags if no manual tags provided
    let finalTagIds = tagIds;
    let aiGeneratedTags: string[] = [];
    
    if (!tagIds || tagIds.length === 0) {
      const tagResult = await aiTagService.generateTags(description, title);

      console.log("tagResult",tagResult);
      
      if (tagResult.success) {
        aiGeneratedTags = tagResult.tags;
        
        // Create or find tags in database
        const tagPromises = tagResult.tags.map(async (tagName:string) => {
          return await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              description: `Auto-generated tag: ${tagName}`,
            },
          });
        });
        
        const createdTags = await Promise.all(tagPromises);
        finalTagIds = createdTags.map(tag => tag.id);
        console.log("createdTage",createdTags);
      } else {
        console.warn('AI tag generation failed:', tagResult.error);
      }
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        description,
        imageUrl,
        readTime,
        published,
        publishedAt: published ? new Date() : null,
        userId,
        ...(finalTagIds &&
          finalTagIds.length > 0 && {
            tags: {
              create: finalTagIds.map((tagId: number) => ({
                tagId,
              })),
            },
          }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    return c.json({ 
      data: newPost,
      ...(aiGeneratedTags.length > 0 && { aiGeneratedTags })
    }, StatusCodes.CREATED);
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json(
      { error: "Failed to create post" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function updatePostById(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const aiTagService = new TagGen(c.env.GEMINI_API_KEY);

  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id) || id <= 0) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

    const body = await c.req.json();
    const parsedPost = updatePostInputSchema.safeParse({ ...body, id });
    if (!parsedPost.success) {
      return c.json(
        {
          error: "Invalid post input",
          details: parsedPost.error.errors,
        },
        StatusCodes.BAD_REQUEST
      );
    }

    const { title, description, imageUrl, published, tagIds } = parsedPost.data;
    const userId = c.get("userId");

    // Check if the post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existingPost) {
      return c.json(
        { error: "Post not found or you are not authorized to update it" },
        StatusCodes.NOT_FOUND
      );
    }

    // Calculate read time if description is being updated
    let readTime = existingPost.readTime;
    if (description && description !== existingPost.description) {
      const wordCount = description.split(/\s+/).length;
      readTime = Math.ceil(wordCount / 200);
    }

    // Determine if we need to update publishedAt
    const shouldSetPublishedAt = published && !existingPost.published;

    // Generate AI tags if content changed and no manual tags provided
    let finalTagIds = tagIds;
    let aiGeneratedTags: string[] = [];
    
    if (description && description !== existingPost.description && (!tagIds || tagIds.length === 0)) {
      const tagResult = await aiTagService.generateTags(description, title || existingPost.title);
      
      if (tagResult.success) {
        aiGeneratedTags = tagResult.tags;
        
        // Create or find tags in database
        const tagPromises = tagResult.tags.map(async (tagName) => {
          return await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              description: `Auto-generated tag: ${tagName}`,
            },
          });
        });
        
        const createdTags = await Promise.all(tagPromises);
        finalTagIds = createdTags.map(tag => tag.id);
      }
    }

    const updatedPost = await prisma.post.update({
      where: {
        id,
        userId,
      },
      data: {
        ...(title && { title }),
        ...(description && { description, readTime }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(published !== undefined && {
          published,
          ...(shouldSetPublishedAt && { publishedAt: new Date() }),
        }),
        ...(finalTagIds && {
          tags: {
            deleteMany: {},
            create: finalTagIds.map((tagId: number) => ({
              tagId,
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    return c.json({ 
      data: updatedPost,
      ...(aiGeneratedTags.length > 0 && { aiGeneratedTags })
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error updating post by ID:", error);
    return c.json(
      { error: "Failed to update post" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function getAllPosts(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const allPosts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
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

// export async function createPost(c: Context) {
//   const prisma = getPrisma(c.env.DATABASE_URL);

//   try {
//     const body = await c.req.json();
//     const parsedPost = postInputSchema.safeParse(body);

//     if (!parsedPost.success) {
//       return c.json(
//         {
//           error: "Invalid post input",
//           details: parsedPost.error.errors,
//         },
//         StatusCodes.BAD_REQUEST
//       );
//     }

//     const {
//       title,
//       description,
//       imageUrl,
//       published,
//       tagIds,
//     } = parsedPost.data;
//     const userId = c.get("userId");



//     const calculateReadTime = (htmlContent: string) => {
//       const wordCount = htmlContent
//         .replace(/<[^>]+>/g, '') // Strip HTML tags
//         .replace(/\[[0-9]+\]/g, '') // Remove citations
//         .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
//         .replace(/\s+/g, ' ') // Normalize spaces
//         .trim()
//         .split(/\s+/).length;
//       return Math.ceil(wordCount / 225); // 225 wpm
//     };

//     const readTime = calculateReadTime(description);

//     const newPost = await prisma.post.create({
//       data: {
//         title,
//         description,
//         imageUrl,
//         readTime,
//         published,
//         publishedAt: published ? new Date() : null,
//         userId,
//         ...(tagIds &&
//           tagIds.length > 0 && {
//             tags: {
//               create: tagIds.map((tagId: number) => ({
//                 tagId,
//               })),
//             },
//           }),
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             username: true,
//             email: true,
//             displayName: true,
//             avatar: true,
//           },
//         },
//         tags: {
//           include: {
//             tag: {
//               select: {
//                 id: true,
//                 name: true,
//                 description: true,
//               },
//             },
//           },
//         },
//         _count: {
//           select: {
//             claps: true,
//             comments: true,
//             bookmarks: true,
//           },
//         },
//       },
//     });

//     return c.json({ data: newPost }, StatusCodes.CREATED);
//   } catch (error) {
//     console.error("Error creating post:", error);
//     return c.json(
//       { error: "Failed to create post" },
//       StatusCodes.INTERNAL_SERVER_ERROR
//     );
//   }
// }

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
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        comments: {
          where: {
            parentId: null, // Only get top-level comments
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, StatusCodes.NOT_FOUND);
    }

    // Restrict access to unpublished posts
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

// export async function updatePostById(c: Context) {
//   const prisma = getPrisma(c.env.DATABASE_URL);

//   try {
//     const id = Number(c.req.param("id"));
//     if (isNaN(id) || id <= 0) {
//       return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
//     }

//     const body = await c.req.json();
//     const parsedPost = updatePostInputSchema.safeParse({ ...body, id });
//     if (!parsedPost.success) {
//       return c.json(
//         {
//           error: "Invalid post input",
//           details: parsedPost.error.errors,
//         },
//         StatusCodes.BAD_REQUEST
//       );
//     }

//     const { title, description, imageUrl, published, tagIds } = parsedPost.data;
//     const userId = c.get("userId");

//     // Check if the post exists and belongs to the user
//     const existingPost = await prisma.post.findUnique({
//       where: {
//         id,
//         userId,
//       },
//     });

//     if (!existingPost) {
//       return c.json(
//         { error: "Post not found or you are not authorized to update it" },
//         StatusCodes.NOT_FOUND
//       );
//     }

//     // Calculate read time if description is being updated
//     let readTime = existingPost.readTime;
//     if (description && description !== existingPost.description) {
//       const wordCount = description.split(/\s+/).length;
//       readTime = Math.ceil(wordCount / 200);
//     }

//     // Determine if we need to update publishedAt
//     const shouldSetPublishedAt = published && !existingPost.published;

//     const updatedPost = await prisma.post.update({
//       where: {
//         id,
//         userId,
//       },
//       data: {
//         ...(title && { title }),
//         ...(description && { description, readTime }),
//         ...(imageUrl !== undefined && { imageUrl }),
//         ...(published !== undefined && {
//           published,
//           ...(shouldSetPublishedAt && { publishedAt: new Date() }),
//         }),
//         ...(tagIds && {
//           tags: {
//             deleteMany: {},
//             create: tagIds.map((tagId: number) => ({
//               tagId,
//             })),
//           },
//         }),
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             username: true,
//             email: true,
//             displayName: true,
//             avatar: true,
//           },
//         },
//         tags: {
//           include: {
//             tag: {
//               select: {
//                 id: true,
//                 name: true,
//                 description: true,
//               },
//             },
//           },
//         },
//         _count: {
//           select: {
//             claps: true,
//             comments: true,
//             bookmarks: true,
//           },
//         },
//       },
//     });

//     return c.json({ data: updatedPost }, StatusCodes.OK);
//   } catch (error) {
//     console.error("Error updating post by ID:", error);
//     return c.json(
//       { error: "Failed to update post" },
//       StatusCodes.INTERNAL_SERVER_ERROR
//     );
//   }
// }

export async function getPostOwner(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const { postId, userId } = c.req.query();

    if (!postId || !userId) {
      return c.json(
        { error: "Missing postId or userId in query parameters" },
        StatusCodes.BAD_REQUEST
      );
    }

    const postIdNum = Number(postId);
    if (isNaN(postIdNum) || postIdNum <= 0) {
      return c.json(
        { error: "Invalid postId format" },
        StatusCodes.BAD_REQUEST
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postIdNum,
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

export async function getUserPosts(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const userId = c.req.param("userId");
    const currentUserId = c.get("userId");

    if (!userId) {
      return c.json({ error: "User ID is required" }, StatusCodes.BAD_REQUEST);
    }

    // If requesting own posts, include unpublished ones
    const includeUnpublished = userId === currentUserId;

    const userPosts = await prisma.post.findMany({
      where: {
        userId,
        ...(includeUnpublished ? {} : { published: true }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({ data: userPosts }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return c.json(
      { error: "Failed to fetch user posts" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function deletePostById(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id) || id <= 0) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

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
        { error: "Post not found or you are not authorized to delete it" },
        StatusCodes.NOT_FOUND
      );
    }

    await prisma.post.delete({
      where: {
        id,
        userId,
      },
    });

    return c.json({ message: "Post deleted successfully" }, StatusCodes.OK);
  } catch (error) {
    console.error("Error deleting post by ID:", error);
    return c.json(
      { error: "Failed to delete post" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

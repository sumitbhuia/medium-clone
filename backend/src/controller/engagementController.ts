import { Context } from "hono";
import { getPrisma } from "../lib/prisma";

enum StatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// Clap/Unclap a post
export async function toggleClap(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const userId = c.get("userId");
    const postId = parseInt(c.req.param("postId"));
    
    if (isNaN(postId)) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return c.json({ error: "Post not found" }, StatusCodes.NOT_FOUND);
    }

    // Check if user already clapped
    const existingClap = await prisma.clap.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let isClapped: boolean;
    let clapCount: number;
    

    if (existingClap) {
      // Remove clap
      await prisma.clap.delete({
        where: { id: existingClap.id }
      });
      isClapped = false;
    } else {
      // Add clap
      await prisma.clap.create({
        data: {
          userId,
          postId,
          count: 1
        }
      });
      isClapped = true;
    }

    // Get updated clap count
    const totalClaps = await prisma.clap.aggregate({
      where: { postId },
      _sum: { count: true }
    });

    clapCount = totalClaps._sum.count || 0;

    return c.json({
      data: {
        isClapped,
        clapCount
      }
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error toggling clap:", error);
    return c.json(
      { error: "Failed to toggle clap" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Bookmark/Unbookmark a post
export async function toggleBookmark(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const userId = c.get("userId");
    const postId = parseInt(c.req.param("postId"));
    
    if (isNaN(postId)) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return c.json({ error: "Post not found" }, StatusCodes.NOT_FOUND);
    }

    // Check if user already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let isBookmarked: boolean;

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      });
      isBookmarked = false;
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId,
          postId
        }
      });
      isBookmarked = true;
    }

    return c.json({
      data: { isBookmarked }
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return c.json(
      { error: "Failed to toggle bookmark" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Get user's bookmarked posts
export async function getUserBookmarks(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const userId = c.get("userId");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                username: true,
                displayName: true,
                avatar: true
              }
            },
            _count: {
              select: {
                claps: true,
                comments: true,
                bookmarks: true
              }
            },
            tags: {
              include: {
                tag: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.post.id.toString(),
      title: bookmark.post.title,
      description: bookmark.post.description,
      createdAt: bookmark.post.createdAt.toISOString(),
      readTime: bookmark.post.readTime || Math.ceil(bookmark.post.description.replace(/<[^>]+>/g, '').split(/\s+/).length / 225),
      imageUrl: bookmark.post.imageUrl,
      User: {
        username: bookmark.post.author.username,
        displayName: bookmark.post.author.displayName,
        avatar: bookmark.post.author.avatar
      },
      clapCount: bookmark.post._count.claps,
      responseCount: bookmark.post._count.comments,
      tags: bookmark.post.tags.map(pt => pt.tag.name),
      bookmarkedAt: bookmark.createdAt.toISOString()
    }));

    return c.json({
      data: formattedBookmarks,
      pagination: {
        page,
        limit,
        hasMore: bookmarks.length === limit
      }
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return c.json(
      { error: "Failed to fetch bookmarks" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Add comment to post
export async function addComment(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const userId = c.get("userId");
    const postId = parseInt(c.req.param("postId"));
    const body = await c.req.json();
    const { content, parentId } = body;
    
    if (isNaN(postId)) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

    if (!content || content.trim().length === 0) {
      return c.json({ error: "Comment content is required" }, StatusCodes.BAD_REQUEST);
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return c.json({ error: "Post not found" }, StatusCodes.NOT_FOUND);
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true }
      });

      if (!parentComment || parentComment.postId !== postId) {
        return c.json({ error: "Invalid parent comment" }, StatusCodes.BAD_REQUEST);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        postId,
        parentId
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      parentId: comment.parentId,
      user: {
        username: comment.user.username,
        displayName: comment.user.displayName,
        avatar: comment.user.avatar
      },
      repliesCount: comment._count.replies
    };

    return c.json({
      data: formattedComment
    }, StatusCodes.CREATED);
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json(
      { error: "Failed to add comment" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Get comments for a post
export async function getPostComments(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const postId = parseInt(c.req.param("postId"));
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;
    
    if (isNaN(postId)) {
      return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);
    }

    // Get top-level comments (no parent)
    const comments = await prisma.comment.findMany({
      where: { 
        postId,
        parentId: null
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                username: true,
                displayName: true,
                avatar: true
              }
            },
            _count: {
              select: {
                replies: true
              }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 3 // Limit initial replies shown
        },
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      user: {
        username: comment.user.username,
        displayName: comment.user.displayName,
        avatar: comment.user.avatar
      },
      repliesCount: comment._count.replies,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        user: {
          username: reply.user.username,
          displayName: reply.user.displayName,
          avatar: reply.user.avatar
        },
        repliesCount: reply._count.replies
      }))
    }));

    return c.json({
      data: formattedComments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit
      }
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json(
      { error: "Failed to fetch comments" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Update comment
export async function updateComment(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const userId = c.get("userId");
    const commentId = parseInt(c.req.param("commentId"));
    const body = await c.req.json();
    const { content } = body;
    
    if (isNaN(commentId)) {
      return c.json({ error: "Invalid comment ID" }, StatusCodes.BAD_REQUEST);
    }

    if (!content || content.trim().length === 0) {
      return c.json({ error: "Comment content is required" }, StatusCodes.BAD_REQUEST);
    }

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (!existingComment) {
      return c.json({ error: "Comment not found" }, StatusCodes.NOT_FOUND);
    }

    if (existingComment.userId !== userId) {
      return c.json({ error: "Unauthorized to edit this comment" }, StatusCodes.FORBIDDEN);
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    const formattedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
      parentId: updatedComment.parentId,
      user: {
        username: updatedComment.user.username,
        displayName: updatedComment.user.displayName,
        avatar: updatedComment.user.avatar
      },
      repliesCount: updatedComment._count.replies
    };

    return c.json({
      data: formattedComment
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error updating comment:", error);
    return c.json(
      { error: "Failed to update comment" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Delete comment
export async function deleteComment(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const userId = c.get("userId");
    const commentId = parseInt(c.req.param("commentId"));
    
    if (isNaN(commentId)) {
      return c.json({ error: "Invalid comment ID" }, StatusCodes.BAD_REQUEST);
    }

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (!existingComment) {
      return c.json({ error: "Comment not found" }, StatusCodes.NOT_FOUND);
    }

    if (existingComment.userId !== userId) {
      return c.json({ error: "Unauthorized to delete this comment" }, StatusCodes.FORBIDDEN);
    }

    // Delete comment and all its replies (cascade)
    await prisma.comment.delete({
      where: { id: commentId }
    });

    return c.json({
      message: "Comment deleted successfully"
    }, StatusCodes.OK);
  } catch (error) {
    console.error("Error deleting comment:", error);
    return c.json(
      { error: "Failed to delete comment" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
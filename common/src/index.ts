import { z } from 'zod';

// Auth Schemas
export const signUpSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

export const signInSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// User Profile Schemas
export const updateUserProfileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").optional(),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
    coverImage: z.string().url("Invalid cover image URL").optional().or(z.literal("")),
    location: z.string().optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

// Post Schemas
export const postInputSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().min(1, "Content is required"),
    imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
    published: z.boolean().default(false),
    tagIds: z.array(z.number().int().positive()).optional(),
});

export const updatePostInputSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
    description: z.string().min(1, "Content is required").optional(),
    imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
    published: z.boolean().optional(),
    tagIds: z.array(z.number().int().positive()).optional(),
    id: z.number().int().positive(),
});

// Tag Schemas
export const tagInputSchema = z.object({
    name: z.string().min(1, "Tag name is required").max(50, "Tag name must be less than 50 characters"),
    description: z.string().optional(),
});

export const updateTagSchema = z.object({
    name: z.string().min(1, "Tag name is required").max(50, "Tag name must be less than 50 characters").optional(),
    description: z.string().optional(),
    id: z.number().int().positive(),
});

// Comment Schemas
export const commentInputSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
    postId: z.number().int().positive(),
    parentId: z.number().int().positive().optional(), // For nested comments
});

export const updateCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
    id: z.number().int().positive(),
});

// Clap Schema
export const clapInputSchema = z.object({
    postId: z.number().int().positive(),
    count: z.number().int().min(1).max(50).default(1), // Limit claps per action
});

// Bookmark Schema
export const bookmarkInputSchema = z.object({
    postId: z.number().int().positive(),
});

// Follow Schema
export const followInputSchema = z.object({
    followingId: z.string().uuid("Invalid user ID format"),
});

// Query Parameter Schemas
export const paginationSchema = z.object({
    page: z.string().transform(val => parseInt(val) || 1).pipe(z.number().int().min(1)),
    limit: z.string().transform(val => parseInt(val) || 10).pipe(z.number().int().min(1).max(100)),
});

export const postFilterSchema = z.object({
    published: z.string().transform(val => val === 'true').optional(),
    tagId: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).optional(),
    authorId: z.string().uuid().optional(),
    search: z.string().optional(),
}).merge(paginationSchema);

export const userFilterSchema = z.object({
    search: z.string().optional(),
}).merge(paginationSchema);

// Response Schemas (for better type safety)
export const apiResponseSchema = z.object({
    data: z.any().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }).optional(),
});

// Type Exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export type PostInput = z.infer<typeof postInputSchema>;
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

export type TagInput = z.infer<typeof tagInputSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export type CommentInput = z.infer<typeof commentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

export type ClapInput = z.infer<typeof clapInputSchema>;
export type BookmarkInput = z.infer<typeof bookmarkInputSchema>;
export type FollowInput = z.infer<typeof followInputSchema>;

export type PaginationInput = z.infer<typeof paginationSchema>;
export type PostFilterInput = z.infer<typeof postFilterSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;

export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Utility validation functions
export const validatePostId = (id: string | number) => {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    return z.number().int().positive().safeParse(numId);
};

export const validateUserId = (id: string) => {
    return z.string().uuid().safeParse(id);
};

export const validateEmail = (email: string) => {
    return z.string().email().safeParse(email);
};

// Constants
export const POST_CONSTANTS = {
    MAX_TITLE_LENGTH: 200,
    MAX_CONTENT_LENGTH: 50000,
    MAX_TAGS_PER_POST: 5,
    WORDS_PER_MINUTE: 200,
} as const;

export const USER_CONSTANTS = {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    MIN_PASSWORD_LENGTH: 6,
    MAX_BIO_LENGTH: 500,
} as const;

export const COMMENT_CONSTANTS = {
    MAX_CONTENT_LENGTH: 1000,
    MAX_NESTING_LEVEL: 3,
} as const;

export const PAGINATION_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;
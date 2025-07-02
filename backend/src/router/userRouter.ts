import { Hono } from "hono";
import {
  getMe,
  getUserProfile,
  getUserPosts,
  updateUserProfile,
  toggleFollow,
  getUserFollowers,
  getUserFollowing,
  upsertUser
} from "../controller/userController";
import { requireAuth } from "../middleware/auth";

export const userRouter = new Hono();

// Public routes
userRouter.get("/me",requireAuth,getMe);
userRouter.get('/:username', getUserProfile); // Get user profile by username
userRouter.get('/:username/posts', getUserPosts); // Get user's posts
userRouter.get('/:username/followers', getUserFollowers); // Get user's followers
userRouter.get('/:username/following', getUserFollowing); // Get user's following

// Protected routes (require authentication)
userRouter.put('/profile', requireAuth, updateUserProfile); // Update own profile
userRouter.post('/follow/:username', requireAuth, toggleFollow); // Follow/unfollow user
userRouter.post('/upsert', upsertUser); // Create/update user (for Supabase webhook)
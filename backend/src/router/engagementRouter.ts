import { Hono } from "hono";
import { 
  toggleClap, 
  toggleBookmark, 
  getUserBookmarks, 
  addComment,
  getPostComments,
  deleteComment,
  updateComment
} from "../controller/engagementController";
import { requireAuth } from "../middleware/auth";

export const engagementRouter = new Hono();

// Clap routes
engagementRouter.post('/clap/:postId', requireAuth, toggleClap);

// Bookmark routes
engagementRouter.post('/bookmark/:postId', requireAuth, toggleBookmark);
engagementRouter.get('/bookmarks', requireAuth, getUserBookmarks);

// Comment routes
engagementRouter.post('/comment/:postId', requireAuth, addComment);
engagementRouter.get('/comments/:postId', getPostComments);
engagementRouter.put('/comment/:commentId', requireAuth, updateComment);
engagementRouter.delete('/comment/:commentId', requireAuth, deleteComment);
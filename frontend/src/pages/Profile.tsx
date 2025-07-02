import React, { useState, useEffect } from 'react';
import { UserProfile, Post ,UpdateUserProfilePayload } from '../types'; 
import { api } from "../api"; 
import { AboutSection } from '../component/Aboutsection'; 
import { ProfileHeader } from '../component/Profileheader'; 
import { ProfileInfo } from '../component/Profileinfo';   
import { NavigationTabs } from '../component/Navigationtabs'; 
import { PostsList } from '../component/Postlist';       
import { ThemeSpinner } from '../component/Spinner';     
import { Header } from '../component/Header';           
import { EditProfileModal } from '../component/EditProfileModal';
import { Edit } from 'lucide-react';


export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  // const [isFollowLoading, setIsFollowLoading] = useState(false); // Kept if ProfileHeader uses it, but /me won't trigger follow
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  // Load profile data for the current user (/me)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profileData = await api.getMe();
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []); // Empty dependency array: Load profile once on mount

  // Load posts when tab changes to home or profile data is available
  useEffect(() => {
    if (activeTab === 'home' && profile?.username) {
      const loadPosts = async () => {
        try {
          setIsLoadingPosts(true);
          const postsData = await api.getUserPosts(profile.username);
          setPosts(postsData.data);
        } catch (err) {
          console.error('Failed to load posts:', err);
          // Optionally set an error state for posts
        } finally {
          setIsLoadingPosts(false);
        }
      };
      loadPosts();
    }
  }, [activeTab, profile]); // Depend on activeTab and profile

  // Follow toggle (relevant if ProfileHeader is generic, less so for /me page)
  // const handleFollowToggle = async () => {
  //   if (!profile || !profile.username) return; // Can't follow self, but for generic component
  //   // For /me page, this button ideally wouldn't be shown or would be disabled.
  //   // If this page could show other users, then this logic would be active.
  //   // try {
  //   //   setIsFollowLoading(true);
  //   //   const result = await api.toggleFollow(profile.username);
  //   //   setProfile(prev => prev ? {
  //   //     ...prev,
  //   //     isFollowing: result.isFollowing,
  //   //     followersCount: prev.followersCount + (result.isFollowing ? 1 : -1)
  //   //   } : null);
  //   // } catch (err) {
  //   //   console.error('Failed to toggle follow:', err);
  //   // } finally {
  //   //   setIsFollowLoading(false);
  //   // }
  // };

  const handlePostClap = async (postId: string) => {
    try {
      await api.toggleClap(postId);
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
            ...post,
            isClapped: !post.isClapped,
            clapCount: post.clapCount + (post.isClapped ? -1 : 1)
          }
          : post
      ));
    } catch (err) {
      console.error('Failed to clap post:', err);
    }
  };

  const handlePostBookmark = async (postId: string) => {
    try {
      await api.toggleBookmark(postId);
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
            ...post,
            isBookmarked: !post.isBookmarked,
            bookmarkCount: post.bookmarkCount + (post.isBookmarked ? -1 : 1)
          }
          : post
      ));
    } catch (err) {
      console.error('Failed to bookmark post:', err);
    }
  };

  const handlePostShare = async (postId: string) => { // Removed async as clipboard API can be sync in some contexts
    const url = `${window.location.origin}/post/${postId}`; // Assuming post routes
    navigator.clipboard.writeText(url)
      .then(() => console.log('URL copied to clipboard'))
      .catch(err => console.error('Failed to copy URL:', err));
  };

  const handleOpenEditModal = () => {
    setProfileSaveError(null); // Clear previous errors
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (updatedData: UpdateUserProfilePayload) => {
    if (!profile) return;
    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      const updatedProfile = await api.updateUserProfile(updatedData);
      setProfile(updatedProfile); // Update local profile state with response from API
      setIsEditModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      console.error('Failed to save profile:', err);
      setProfileSaveError(errorMessage);
      // Keep modal open if there's an error
    } finally {
      setIsSavingProfile(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <ThemeSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-gray-50 p-8 rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-sans font-medium text-gray-900">Profile not found</h2>
          <p className="text-gray-500 text-sm max-w-sm font-sans">
            {error || 'The requested profile could not be found or you might not be authenticated.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header showAvatar={false} /> {/* Assuming Header component exists */}
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Profile Section */}
        <div className="bg-white rounded-b-xl pt-16 md:pt-20 pb-6">
          {/* Pass isOwnProfile={true} and onEdit={handleOpenEditModal} to ProfileHeader if it's designed to handle it */}
          {/* For now, adding an edit button separately */}
          <div className="relative">
            <ProfileHeader
              profile={profile}
               isFollowing={profile.isFollowing} // Not relevant for /me
               //onFollowToggle={handleFollowToggle} // Not relevant for /me
              // isLoading={isFollowLoading} // Not relevant for /me
              //isOwnProfile={true} // Explicitly state it's own profile
              //onEditProfile={handleOpenEditModal} // Pass edit handler
            />
             {/* Edit button positioned within ProfileHeader's container or nearby */}
             {/* If ProfileHeader doesn't support an edit button slot, place it here: */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                 <button
                    onClick={handleOpenEditModal}
                    className="p-2 bg-white bg-opacity-80 hover:bg-opacity-100 backdrop-blur-sm rounded-full text-gray-600 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                    aria-label="Edit profile"
                  >
                    <Edit className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
            </div>
          </div>
          
          <div className="mt-6 px-4 md:px-6">
            <ProfileInfo profile={profile} /> {/* Assuming ProfileInfo component exists */}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white sticky top-0 z-10 mt-6">
            <NavigationTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            /> 

        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'home' && (
            <div className="space-y-8">
              {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
                </div>
              ) : posts.length > 0 ? (
                <PostsList
                  posts={posts}
                  onClap={handlePostClap}
                  onBookmark={handlePostBookmark}
                  onShare={handlePostShare}
                  isLoading={false} // isLoadingPosts handles the list's loading state
                /> 
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No posts yet</h3>
                    <p className="mt-1 text-sm text-gray-500">This user hasn't published any posts.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && profile && (
            <div className=" p-6 md:p-8">
              <AboutSection profile={profile} />
            </div>
          )}
        </div>
      </div>

      {profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          profile={profile}
          onSave={handleSaveProfile}
          isSaving={isSavingProfile}
          saveError={profileSaveError}
        />
      )}
    </div>
  );
};

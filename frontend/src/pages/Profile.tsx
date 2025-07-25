import React, { useState, useEffect } from 'react';
import { UserProfile, Post, UpdateUserProfilePayload } from '../types'; 
import { api } from "../api"; 
import { SavedPosts } from '../component/SavedPosts';
import { ProfileHeader } from '../component/Profileheader'; 
import { ProfileInfo } from '../component/Profileinfo';   
import { NavigationTabs } from '../component/Navigationtabs'; 
import { PostsList } from '../component/Postlist';       
import { ThemeSpinner } from '../component/Spinner';     
import { Header } from '../component/Header';           
import { EditProfileModal } from '../component/EditProfileModal';
import { Edit } from 'lucide-react';


export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'bookmarks'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

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
  }, []);

  useEffect(() => {
    // Only fetch user's own posts when home tab is active
    if (activeTab === 'home' && profile?.username) {
      const loadPosts = async () => {
        try {
          setIsLoadingPosts(true);
          const postsData = await api.getUserPosts(profile.username);
          setPosts(postsData.data);
        } catch (err) {
          console.error('Failed to load posts:', err);
        } finally {
          setIsLoadingPosts(false);
        }
      };
      loadPosts();
    }
  }, [activeTab, profile]);


  const handleOpenEditModal = () => {
    setProfileSaveError(null);
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
      setProfile(updatedProfile);
      setIsEditModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      console.error('Failed to save profile:', err);
      setProfileSaveError(errorMessage);
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
      <Header showAvatar={false} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-b-xl pt-16 md:pt-20 pb-6">
          <div className="relative">
            <ProfileHeader
              profile={profile}
              isFollowing={profile.isFollowing}
            />
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
            <ProfileInfo profile={profile} />
          </div>
        </div>

        <div className="bg-white sticky top-0 z-10 mt-6">
            <NavigationTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            /> 
        </div>

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
                  isLoading={false}
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

          {/* Render the SavedPosts component when the 'about' tab is active */}
          {activeTab === 'bookmarks' && (
            <div className="p-6 md:p-8">
              <SavedPosts />
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

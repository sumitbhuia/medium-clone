import { UserProfile } from "../types";
import { Edit, Settings } from 'lucide-react';

export const ProfileHeader: React.FC<{
  profile: UserProfile;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  isLoading?: boolean;
}> = ({ profile, isFollowing, onFollowToggle, isLoading }) => (
  <div className="relative">
    {profile.coverImage && (
      <div className="h-48 sm:h-64 relative overflow-hidden">
        <img
          src={profile.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-10" />
      </div>
    )}
    <div className="max-w-5xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 relative">
      <div className="flex items-end space-x-4 -mt-12 sm:-mt-16">
        <div className="relative">
          <img
            src={profile.avatar || '/default-avatar.png'}
            alt={profile.displayName}
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-white bg-white object-cover"
          />
        </div>
        <div className="flex-1 pt-4">
          <h1 className="text-2xl sm:text-3xl font-sans font-medium text-gray-900 tracking-wide">
            {profile.displayName}
          </h1>
          <p className="text-base text-gray-500 font-sans mt-1">@{profile.username}</p>
        </div>
        <div className="flex items-center space-x-3 pb-4">
          {profile.isOwnProfile ? (
            <button className="flex items-center px-4 py-2 bg-white border border-gray-100 text-gray-700 rounded-md text-sm font-sans font-medium hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={onFollowToggle}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-sm font-sans font-medium transition-colors ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
            </button>
          )}
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
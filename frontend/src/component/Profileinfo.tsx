import { UserProfile } from "../types";
import { Users } from 'lucide-react';

export const ProfileInfo: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="py-6 border-b border-gray-100">
      <div className="max-w-2xl mx-auto space-y-4">
        {profile.bio && (
          <p className="text-slate-600 text-lg leading-relaxed tracking-wide">
            {profile.bio}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-sans">
          <span className="flex items-center hover:text-green-500 transition-colors">
            <Users className="h-4 w-4 mr-1" />
            {profile.followersCount.toLocaleString()} Followers
          </span>
          <span className="hover:text-green-500 transition-colors">
            {profile.followingCount} Following
          </span>
          <span className="hover:text-green-500 transition-colors">
            {profile.postsCount} Posts
          </span>
          {profile.location && <span>{profile.location}</span>}
          <span>Joined {formatJoinDate(profile.joinedDate)}</span>
        </div>
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-green-500 hover:text-green-600 text-sm font-sans transition-colors"
          >
            {profile.website}
          </a>
        )}
      </div>
    </div>
  );
};
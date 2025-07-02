import { UserProfile } from "../types";

export const AboutSection: React.FC<{
  profile: UserProfile;
}> = ({ profile }) => {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {profile.bio && (
        <p className="text-gray-700 font-sans text-lg leading-relaxed tracking-wide">
          {profile.bio}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center py-4 bg-white border border-gray-100 rounded-lg">
          <div className="text-2xl font-sans font-medium text-gray-900">
            {profile.postsCount}
          </div>
          <div className="text-sm text-gray-500 font-sans mt-1">Posts</div>
        </div>
        <div className="text-center py-4 bg-white border border-gray-100 rounded-lg">
          <div className="text-2xl font-sans font-medium text-gray-900">
            {profile.followersCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 font-sans mt-1">Followers</div>
        </div>
        <div className="text-center py-4 bg-white border border-gray-100 rounded-lg">
          <div className="text-2xl font-sans font-medium text-gray-900">
            {profile.followingCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 font-sans mt-1">Following</div>
        </div>
      </div>

      {profile.location && (
        <div className="space-y-2">
          <h3 className="text-sm font-sans font-medium text-gray-900">Location</h3>
          <p className="text-gray-600 font-sans text-base">{profile.location}</p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-sans font-medium text-gray-900">Member since</h3>
        <p className="text-gray-600 font-sans text-base">{formatJoinDate(profile.joinedDate)}</p>
      </div>
    </div>
  );
};
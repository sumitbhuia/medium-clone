import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { UserProfile, UpdateUserProfilePayload } from '../types'; // Adjust path as needed

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfileData: UpdateUserProfilePayload) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
}

// SVG Icon for close button
const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isSaving,
  saveError,
}) => {
  const [formData, setFormData] = useState<UpdateUserProfilePayload>({});

  useEffect(() => {
    // Pre-fill form when profile data is available or changes
    if (profile) {
      setFormData({
        username: profile.username || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        coverImage: profile.coverImage || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    }
  }, [profile, isOpen]); // Re-initialize form when modal opens or profile changes

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Filter out empty strings for optional fields to avoid sending them as ""
    // The backend should handle undefined vs empty string appropriately if needed.
    const payload: UpdateUserProfilePayload = {};
    for (const key in formData) {
        const typedKey = key as keyof UpdateUserProfilePayload;
        if (formData[typedKey] !== profile[typedKey as keyof UserProfile] && formData[typedKey] !== null) {
             // Only include fields that have changed from original profile or are not null
            if (formData[typedKey] === '' && (profile[typedKey as keyof UserProfile] === null || profile[typedKey as keyof UserProfile] === undefined)) {
                // If new value is empty string and original was null/undefined, don't send (treat as unchanged or explicitly cleared if backend handles null)
                // Or, if you want to allow clearing fields by sending empty string:
                // payload[typedKey] = formData[typedKey];
            } else {
                 payload[typedKey] = formData[typedKey];
            }
        } else if (formData[typedKey] !== null && formData[typedKey] !== profile[typedKey as keyof UserProfile]) {
            // This case handles if original was null and new value is not null
             payload[typedKey] = formData[typedKey];
        }
    }
    // If username is part of formData and hasn't changed, don't send it unless it's explicitly allowed
    // For this example, we send all fields that are in formData
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
              <strong className="font-medium">Error:</strong> {saveError}
            </div>
          )}

          {/* Form Fields */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="e.g., cooldev123"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              name="displayName"
              id="displayName"
              value={formData.displayName || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="e.g., Alex Smith"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              id="bio"
              rows={3}
              value={formData.bio || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="Tell us a bit about yourself"
            />
          </div>
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input
              type="url"
              name="avatar"
              id="avatar"
              value={formData.avatar || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="https://example.com/avatar.png"
            />
          </div>
          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              name="coverImage"
              id="coverImage"
              value={formData.coverImage || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="https://example.com/cover.png"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              name="website"
              id="website"
              value={formData.website || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="https://your-website.com"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-100 space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit} // Also trigger form submission
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

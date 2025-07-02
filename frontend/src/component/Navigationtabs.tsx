export const NavigationTabs: React.FC<{
  activeTab: 'home' | 'about';
  onTabChange: (tab: 'home' | 'about') => void;
}> = ({ activeTab, onTabChange }) => (
  <div className="sticky top-0 bg-white z-10 ">
    <nav className="flex space-x-6 max-w-2xl mx-auto">
      <button
        onClick={() => onTabChange('home')}
        className={`py-3 px-2 border-b-2 font-sans text-sm font-medium transition-colors ${
          activeTab === 'home'
            ? 'border-green-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-green-500'
        }`}
      >
        Home
      </button>
      <button
        onClick={() => onTabChange('about')}
        className={`py-3 px-2 border-b-2 font-sans text-sm font-medium transition-colors ${
          activeTab === 'about'
            ? 'border-green-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-green-500'
        }`}
      >
        About
      </button>
    </nav>
  </div>
);
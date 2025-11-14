import React from 'react';
// Simple cn utility function since @/lib/utils is not available
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  badgeClassName?: string;
}

function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  tabClassName = '',
  activeTabClassName = 'bg-zinc-700 dark:bg-zinc-800 text-white shadow-md',
  badgeClassName = 'bg-green-500 text-white',
}: TabsProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all relative',
            activeTab === tab.id
              ? activeTabClassName
              : 'text-zinc-400 hover:bg-zinc-800 dark:hover:bg-zinc-900 hover:text-white',
            tabClassName
          )}
          title={tab.label}
        >
          <div className='relative'>
            {tab.icon}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  'absolute -top-2 -right-2 text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg',
                  badgeClassName
                )}
              >
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export { Tabs };

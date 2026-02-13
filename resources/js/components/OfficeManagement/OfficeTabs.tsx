import { Building2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

type TabKey = 'offices' | 'users';

type Tab = {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
};

type Props = {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
    children: React.ReactNode;
    panelId?: string;
};

const tabs: Tab[] = [
    { key: 'offices', label: 'Offices', icon: <Building2 size={16} /> },
    { key: 'users', label: 'Users', icon: <Users size={16} /> },
];

export default function OfficeTabs({
    activeTab,
    onTabChange,
    children,
    panelId = 'tabpanel',
}: Props) {
    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const currentIndex = tabs.findIndex((tab) => tab.key === activeTab);

        if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
            onTabChange(tabs[currentIndex + 1].key);
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            onTabChange(tabs[currentIndex - 1].key);
            e.preventDefault();
        }
    };

    return (
        <Card className="p-6">
            <div
                role="tablist"
                onKeyDown={handleKeyDown}
                className="mb-6 flex gap-1 border-b border-gray-200 dark:border-neutral-700"
                aria-label="Tab navigation"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        id={`tab-${tab.key}`}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        aria-controls={`${panelId}-${tab.key}`}
                        tabIndex={activeTab === tab.key ? 0 : -1}
                        onClick={() => onTabChange(tab.key)}
                        className={`relative flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none ${
                            activeTab === tab.key
                                ? 'text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.key && (
                            <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            <div
                id={`${panelId}-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                className="animate-in duration-200 fade-in"
            >
                {children}
            </div>
        </Card>
    );
}

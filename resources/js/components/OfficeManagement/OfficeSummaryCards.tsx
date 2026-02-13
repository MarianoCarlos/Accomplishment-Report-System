import { Building2, User, Users, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type Props = {
    totalOffices: number;
    totalSignatories: number;
    totalUsers: number;
};

type SummaryCardProps = {
    icon: LucideIcon;
    label: string;
    value: number;
    color: 'blue' | 'emerald' | 'purple';
};

function SummaryCard({ icon: Icon, label, value, color }: SummaryCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        emerald:
            'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    };

    const tooltipText = `${value.toLocaleString()} ${label.toLowerCase()}`;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Card
                    className="p-6 transition cursor-help hover:shadow-md"
                    aria-label={`${label}: ${value.toLocaleString()}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`rounded-md p-2 ${colorClasses[color]}`}>
                            <Icon size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {label}
                        </span>
                    </div>
                    <p className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">
                        {value.toLocaleString()}
                    </p>
                </Card>
            </TooltipTrigger>
            <TooltipContent>{tooltipText}</TooltipContent>
        </Tooltip>
    );
}

export default function OfficeSummaryCards({
    totalOffices,
    totalSignatories,
    totalUsers,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
                icon={Building2}
                label="Total Offices"
                value={totalOffices}
                color="blue"
            />
            <SummaryCard
                icon={User}
                label="Total Signatories"
                value={totalSignatories}
                color="emerald"
            />
            <SummaryCard
                icon={Users}
                label="Total Users"
                value={totalUsers}
                color="purple"
            />
        </div>
    );
}

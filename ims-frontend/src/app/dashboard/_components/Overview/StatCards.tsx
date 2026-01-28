import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'red' | 'blue' | 'green' | 'yellow';
};

const colorClasses: Record<string, string> = {
    red: 'text-red-500 dark:text-red-400',
    blue: 'text-blue-500 dark:text-blue-400',
    green: 'text-emerald-500 dark:text-emerald-400',
    yellow: 'text-amber-500 dark:text-amber-400'
};

export default function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <Card className="flex flex-col p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className={cn(colorClasses[color], '[&>svg]:h-5 [&>svg]:w-5')}>
                    {icon}
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                    {title}
                </h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
        </Card>
    );
}

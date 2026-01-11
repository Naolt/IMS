import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'red' | 'blue' | 'green' | 'yellow'; // Define valid colors
};

const colorClasses: Record<string, { bg: string; text: string }> = {
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' }
};

export default function StatCard({ title, value, icon, color }: StatCardProps) {
    const { bg, text } = colorClasses[color];

    return (
        <Card className="flex flex-col p-6 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={cn(
                        bg,
                        text,
                        'p-3 rounded-full flex items-center justify-center w-12 h-12'
                    )}
                >
                    {icon}
                </div>
                <p className="text-xl font-bold">{value}</p>
            </div>
            <h3 className="text-base font-medium text-muted-foreground">
                {title}
            </h3>
        </Card>
    );
}

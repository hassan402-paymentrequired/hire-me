import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuickActions = ({ onCopyToAll, onApplyTemplate, onReset }) => {
    const templates = [
        {
            name: 'Standard 9-5',
            description: 'Monday-Friday: 9:00 AM - 5:00 PM',
            icon: 'Briefcase'
        },
        {
            name: 'Retail Hours',
            description: 'Monday-Saturday: 10:00 AM - 8:00 PM',
            icon: 'ShoppingBag'
        },
        {
            name: 'Salon Schedule',
            description: 'Tuesday-Saturday: 9:00 AM - 7:00 PM',
            icon: 'Scissors'
        }
    ];

    return (
        <div className="bg-card rounded-lg border border-border p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <Zap size={24}  />
                <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        Quick Actions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Apply templates or copy schedules
                    </p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Schedule Templates</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {templates?.map((template, index) => (
                            <button
                                key={index}
                                onClick={() => onApplyTemplate(template?.name)}
                                className="flex items-start gap-3 p-3 md:p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-elevation-1 transition-smooth text-left"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Zap size={20} color="var(--color-primary)" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-foreground">{template?.name}</h5>
                                    <p className="text-xs text-muted-foreground mt-1">{template?.description}</p>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Bulk Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={onCopyToAll}
                        >
                            Copy Monday to All
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onReset}
                        >
                            Reset All
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;

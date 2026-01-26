import { BuildingOfficeIcon, ClockIcon, ScissorsIcon } from '@heroicons/react/24/solid';

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: any;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'profile',
        title: 'Business Profile',
        description: 'Set up your business identity and public details.',
        icon: BuildingOfficeIcon,
    },
    {
        id: 'hours',
        title: 'Work Hours',
        description: 'Define when you are available for bookings.',
        icon: ClockIcon,
    },
    {
        id: 'services',
        title: 'Services',
        description: 'Add the services you offer to clients.',
        icon: ScissorsIcon,
    },
];

/**
 * Get steps with status based on current step ID
 */
export function getStepsWithStatus(currentStepId: string) {
    const currentStepIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStepId);
    
    return ONBOARDING_STEPS.map((step, index) => {
        let status: 'current' | 'completed' | 'upcoming';
        
        if (index < currentStepIndex) {
            status = 'completed';
        } else if (index === currentStepIndex) {
            status = 'current';
        } else {
            status = 'upcoming';
        }
        
        return {
            ...step,
            status,
        };
    });
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import type { Provider, TeamMember } from '../types';

interface TeamMemberPickerProps {
    provider: Provider;
    teamMembers: TeamMember[];
    selectedTeamMemberId: string;
    onSelectedTeamMemberIdChange: (id: string) => void;
    canBookProvider: boolean;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function TeamMemberPicker({
    provider,
    teamMembers,
    selectedTeamMemberId,
    onSelectedTeamMemberIdChange,
    canBookProvider,
}: TeamMemberPickerProps) {
    if (teamMembers.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-xl font-semibold tracking-tight">
                    Choose who attends to you
                </h3>
                <p className="text-sm text-muted-foreground">
                    Optional. Leave this set to provider if you do not have a
                    preference.
                </p>
            </div>
            <RadioGroup
                value={selectedTeamMemberId || '__provider__'}
                onValueChange={(value) => {
                    if (!canBookProvider) return;
                    onSelectedTeamMemberIdChange(
                        value === '__provider__' ? '' : value,
                    );
                }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                disabled={!canBookProvider}
            >
                <FieldLabel htmlFor="provider-owner">
                    <Field orientation="horizontal">
                        <FieldContent className="gap-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={provider.logo || undefined}
                                        alt={provider.name}
                                    />
                                    <AvatarFallback>
                                        {getInitials(provider.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <FieldTitle>{provider.name}</FieldTitle>
                                    <FieldDescription className="mt-0 text-xs">
                                        Business owner
                                    </FieldDescription>
                                </div>
                            </div>
                            <FieldDescription>
                                Book directly with the provider.
                            </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                            value="__provider__"
                            id="provider-owner"
                        />
                    </Field>
                </FieldLabel>

                {teamMembers.map((member) => (
                    <FieldLabel
                        key={member.id}
                        htmlFor={`team-member-${member.id}`}
                    >
                        <Field orientation="horizontal">
                            <FieldContent className="gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={member.avatar || undefined}
                                            alt={member.name}
                                        />
                                        <AvatarFallback>
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <FieldTitle className="capitalize">
                                            {member.name}
                                        </FieldTitle>
                                        <FieldDescription className="mt-0 text-xs capitalize">
                                            {member.role}
                                        </FieldDescription>
                                    </div>
                                </div>
                                <FieldDescription className="truncate">
                                    {member.email}
                                </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem
                                value={member.id}
                                id={`team-member-${member.id}`}
                            />
                        </Field>
                    </FieldLabel>
                ))}
            </RadioGroup>
        </div>
    );
}

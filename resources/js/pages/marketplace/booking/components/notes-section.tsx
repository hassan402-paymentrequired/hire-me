import { Textarea } from '@/components/ui/textarea';

interface NotesSectionProps {
    notes: string;
    onNotesChange: (next: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
    return (
        <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">
                Additional Notes
            </h3>
            <Textarea
                placeholder="Add any special requests or information for the provider..."
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                className="text-sm"
            />
        </div>
    );
}

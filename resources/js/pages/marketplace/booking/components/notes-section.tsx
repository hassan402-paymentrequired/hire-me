import { Textarea } from '@/components/ui/textarea';

interface NotesSectionProps {
    notes: string;
    onNotesChange: (next: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
    return (
        <Textarea
            placeholder="Add any special requests or information for the provider..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="text-sm"
        />
    );
}

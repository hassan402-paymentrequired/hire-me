import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OnboardingLayout from '@/layouts/onboarding-layout';
import onboarding from '@/routes/onboarding';
import { useForm } from '@inertiajs/react';
import { Building2, Clock, Scissors, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormSelect } from '@/components/ui/form-select';
import { useState } from 'react';

const STEPS = [
    {
        id: 'profile',
        title: 'Business Profile',
        description: 'Set up your business identity and public details.',
        icon: Building2,
        status: 'completed' as const,
    },
    {
        id: 'hours',
        title: 'Work Hours',
        description: 'Define when you are available for bookings.',
        icon: Clock,
        status: 'completed' as const,
    },
    {
        id: 'services',
        title: 'Services',
        description: 'Add the services you offer to clients.',
        icon: Scissors,
        status: 'completed' as const,
    },
    {
        id: 'verification',
        title: 'Verification',
        description: 'Verify your identity to build trust with clients.',
        icon: ShieldCheck,
        status: 'current' as const,
    },
];

interface Props {
    existingVerification?: {
        status: string;
        document_type: string;
        rejection_reason?: string | null;
        created_at: string;
    } | null;
    is_verified?: boolean;
}

export default function Verification({ existingVerification, is_verified }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        document_type: '',
        document: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('document', file);
            
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.verification.store().url, {
            forceFormData: true,
        });
    };

    const skip = () => {
        post(onboarding.skip().url);
    };

    const documentTypeOptions = [
        { value: 'passport', label: 'Passport' },
        { value: 'national_id', label: 'National ID Card' },
        { value: 'drivers_license', label: "Driver's License" },
    ];

    return (
        <OnboardingLayout
            title="Verify Your Identity"
            steps={STEPS}
            currentStepId="verification"
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Verify your identity
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Upload a government-issued ID to verify your identity. This helps build trust with clients and may be required for certain features.
                    </p>
                </div>

                {/* Show existing verification status */}
                {is_verified && (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-900 dark:text-green-100">
                                        You are verified!
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Your identity has been verified. You can proceed to your dashboard.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {existingVerification && !is_verified && (
                    <Card className={
                        existingVerification.status === 'pending' 
                            ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                            : 'border-red-200 bg-red-50 dark:bg-red-950/20'
                    }>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                {existingVerification.status === 'pending' ? (
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold">
                                        {existingVerification.status === 'pending' 
                                            ? 'Verification Pending'
                                            : 'Verification Rejected'}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {existingVerification.status === 'pending' 
                                            ? `Your verification request submitted on ${new Date(existingVerification.created_at).toLocaleDateString()} is currently under review. We'll notify you once it's processed.`
                                            : existingVerification.rejection_reason || 'Your verification request was rejected. Please submit a new document.'}
                                    </p>
                                    {existingVerification.status === 'rejected' && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Document Type: {documentTypeOptions.find(opt => opt.value === existingVerification.document_type)?.label || existingVerification.document_type}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(!existingVerification || existingVerification.status === 'rejected') && !is_verified && (
                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Verification Document</CardTitle>
                                <CardDescription>
                                    Accepted formats: JPG, PNG, or PDF (max 5MB)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="document_type">Document Type</Label>
                                    <FormSelect
                                        id="document_type"
                                        value={data.document_type}
                                        onChange={(value) => setData('document_type', value)}
                                        options={documentTypeOptions}
                                        placeholder="Select document type"
                                    />
                                    {errors.document_type && (
                                        <p className="text-sm text-destructive">
                                            {errors.document_type}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document">Document</Label>
                                    <div className="space-y-4">
                                        <Input
                                            id="document"
                                            type="file"
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={handleFileChange}
                                            className="cursor-pointer"
                                        />
                                        {errors.document && (
                                            <p className="text-sm text-destructive">
                                                {errors.document}
                                            </p>
                                        )}
                                        
                                        {preview && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium mb-2">Preview:</p>
                                                <img 
                                                    src={preview} 
                                                    alt="Document preview" 
                                                    className="max-w-full h-auto max-h-64 rounded-lg border border-border"
                                                />
                                            </div>
                                        )}
                                        
                                        {selectedFile && !preview && (
                                            <div className="mt-4 p-3 rounded-lg bg-muted">
                                                <p className="text-sm font-medium">
                                                    Selected: {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                        <strong>Security Note:</strong> Your document will be stored securely and only used for verification purposes. It will be reviewed by our admin team.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing || !data.document_type || !selectedFile}
                                className="w-full md:w-auto"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Submit for Verification
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={skip}
                                disabled={processing}
                            >
                                Skip for now
                            </Button>
                        </div>
                    </form>
                )}

                {(is_verified || (existingVerification?.status === 'pending')) && (
                    <div className="flex justify-end">
                        <Button 
                            onClick={() => window.location.href = '/business/dashboard'}
                            size="lg"
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </OnboardingLayout>
    );
}

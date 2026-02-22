import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FormSelect } from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import VerificationLayout from '@/layouts/verification-layout';
import business from '@/routes/business';
import onboarding from '@/routes/onboarding';
import verification from '@/routes/verification';
import { Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    existingVerification?: {
        status: string;
        document_type: string;
        rejection_reason?: string | null;
        created_at: string;
    } | null;
    is_verified?: boolean;
}

export default function Verification({
    existingVerification,
    is_verified,
}: Props) {
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
        post(verification.submit().url, {
            forceFormData: true,
        });
    };

    const documentTypeOptions = [
        { value: 'national_id', label: 'National ID (NIN Slip)' },
        { value: 'drivers_license', label: "Driver's License" },
        { value: 'passport', label: 'International Passport' },
        {
            value: 'cac_registration',
            label: 'CAC Registration (For Registered Businesses)',
        },
    ];

    return (
        <VerificationLayout title="Verify Your Identity">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Verify your identity
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Upload a valid document to verify your identity. This
                        helps build trust with clients and ensures a safe
                        marketplace.
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
                                        Your identity has been verified. You can
                                        proceed to your dashboard.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {existingVerification && !is_verified && (
                    <Card
                        className={
                            existingVerification.status === 'pending'
                                ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                                : 'border-red-200 bg-red-50 dark:bg-red-950/20'
                        }
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                {existingVerification.status === 'pending' ? (
                                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                ) : (
                                    <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold">
                                        {existingVerification.status ===
                                        'pending'
                                            ? 'Verification Pending'
                                            : 'Verification Rejected'}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {existingVerification.status ===
                                        'pending'
                                            ? `Your verification request submitted on ${new Date(existingVerification.created_at).toLocaleDateString()} is currently under review. We'll notify you once it's processed.`
                                            : existingVerification.rejection_reason ||
                                              'Your verification request was rejected. Please submit a new document.'}
                                    </p>
                                    {existingVerification.status ===
                                        'rejected' && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Document Type:{' '}
                                            {documentTypeOptions.find(
                                                (opt) =>
                                                    opt.value ===
                                                    existingVerification.document_type,
                                            )?.label ||
                                                existingVerification.document_type}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(!existingVerification ||
                    existingVerification.status === 'rejected') &&
                    !is_verified && (
                        <form onSubmit={submit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Upload Verification Document
                                    </CardTitle>
                                    <CardDescription>
                                        Accepted formats: JPG, PNG, or PDF (max
                                        5MB)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <FormSelect
                                            label="Document Type"
                                            value={data.document_type}
                                            onChange={(value) =>
                                                setData('document_type', value)
                                            }
                                            options={documentTypeOptions.map(
                                                (opt) => ({
                                                    value: opt.value,
                                                    label: opt.label,
                                                }),
                                            )}
                                            placeholder="Select document type"
                                            required
                                            error={errors.document_type}
                                        />
                                        {data.document_type && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {
                                                    documentTypeOptions.find(
                                                        (opt) =>
                                                            opt.value ===
                                                            data.document_type,
                                                    )?.description
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="document">
                                            Document
                                        </Label>
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
                                                    <p className="mb-2 text-sm font-medium">
                                                        Preview:
                                                    </p>
                                                    <img
                                                        src={preview}
                                                        alt="Document preview"
                                                        className="h-auto max-h-64 max-w-full rounded-lg border border-border"
                                                    />
                                                </div>
                                            )}

                                            {selectedFile && !preview && (
                                                <div className="mt-4 rounded-lg bg-muted p-3">
                                                    <p className="text-sm font-medium">
                                                        Selected:{' '}
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(
                                                            selectedFile.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{' '}
                                                        MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950/20">
                                            <p className="mb-2 text-sm text-blue-900 dark:text-blue-100">
                                                <strong>
                                                    🔒 Security Note:
                                                </strong>{' '}
                                                Your document will be stored
                                                securely and encrypted. It will
                                                only be used for verification
                                                purposes and reviewed by our
                                                admin team.
                                            </p>
                                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                                <strong>Important:</strong>{' '}
                                                Never share your NIN or BVN. We
                                                do not require or store these
                                                sensitive numbers.
                                            </p>
                                        </div>

                                        {data.document_type ===
                                            'bank_statement' && (
                                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20">
                                                <p className="text-sm text-amber-900 dark:text-amber-100">
                                                    <strong>
                                                        ⚠️ For Bank Statements:
                                                    </strong>{' '}
                                                    Please redact (black out)
                                                    sensitive information like
                                                    account numbers, transaction
                                                    details, and balances. Only
                                                    show your name, address, and
                                                    bank name.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={
                                        processing ||
                                        !data.document_type ||
                                        !selectedFile
                                    }
                                    className="w-full md:w-auto"
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    Submit for Verification
                                </Button>
                                <Link href={business.dashboard().url}>
                                    <Button type="button" variant="ghost">
                                        Skip for now
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    )}

                {(is_verified ||
                    existingVerification?.status === 'pending') && (
                    <div className="flex justify-end">
                        <Button
                            onClick={() => router.visit('/business')}
                            size="lg"
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </VerificationLayout>
    );
}

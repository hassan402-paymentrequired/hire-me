import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import  AppLayout  from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/form-select';
import { Loader2, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import business from '@/routes/business';
import type { BreadcrumbItem } from '@/types';

interface Props {
    profile: {
        id: string;
        slug: string;
        widget_enabled?: boolean;
        widget_settings?: Record<string, any>;
    };
}

export default function IntegrationWidget({ profile }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: business.dashboard() },
        { title: 'Integration', href: '' },
    ];

    const { data, setData } = useForm({
        widget_enabled: profile?.widget_enabled || false,
        widget_settings: (profile?.widget_settings || { 
            primaryColor: '#3B82F6', 
            size: 'medium',
            cardBackground: '#FFFFFF',
            textColor: '#000000',
            borderRadius: '8',
            padding: '24',
            borderColor: '#E5E7EB',
            inputBackground: '#FFFFFF',
            inputBorderColor: '#D1D5DB',
            inputTextColor: '#000000',
            buttonBorderRadius: '6',
            buttonFontSize: '14',
            labelFontSize: '14',
            labelFontWeight: '500',
            serviceCardHoverColor: '#F3F4F6',
            summaryBackground: '#F9FAFB',
            fontFamily: 'default',
            boxShadow: 'md',
            requirePayment: true,
        }) as Record<string, any>,
    } as any);

    const [savingWidget, setSavingWidget] = useState(false);

    const saveWidgetSettings = async (settings: any, enabled?: boolean) => {
        setSavingWidget(true);
        try {
            await axios.post('/business/widget/settings', {
                widget_enabled: enabled !== undefined ? enabled : data.widget_enabled,
                widget_settings: settings,
            });
            // toast.success('Widget settings saved');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save widget settings');
        } finally {
            setSavingWidget(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <main className="flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Integration</h2>
                        <p className="text-sm text-muted-foreground">Embed your booking widget on your website</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Embeddable Booking Widget</h3>
                                <p className="text-sm text-muted-foreground">
                                    Allow customers to book appointments directly on your website
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {savingWidget && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                <input
                                    type="checkbox"
                                    id="widget_enabled"
                                    checked={data.widget_enabled}
                                    onChange={(e) => {
                                        const newValue = e.target.checked;
                                        setData('widget_enabled', newValue);
                                        saveWidgetSettings(data.widget_settings, newValue);
                                    }}
                                    className="h-4 w-4 rounded border-gray-300"
                                    disabled={savingWidget}
                                />
                                <Label htmlFor="widget_enabled" className="cursor-pointer">
                                    Enable Widget
                                </Label>
                            </div>
                        </div>

                        {data.widget_enabled && (
                            <div className="space-y-6 mt-6">
                                {/* Widget Customization */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold">Appearance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="widget_color">Primary Color (Buttons)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="widget_color"
                                                    type="color"
                                                    value={data.widget_settings?.primaryColor || '#3B82F6'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, primaryColor: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    className="h-10 w-20 p-1"
                                                />
                                                <Input
                                                    type="text"
                                                    value={data.widget_settings?.primaryColor || '#3B82F6'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, primaryColor: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    placeholder="#3B82F6"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="widget_size">Widget Size</Label>
                                            <FormSelect
                                                options={[
                                                    { value: 'small', label: 'Small (400px)' },
                                                    { value: 'medium', label: 'Medium (600px)' },
                                                    { value: 'large', label: 'Large (800px)' },
                                                ]}
                                                value={data.widget_settings?.size || 'medium'}
                                                onChange={(val) => {
                                                    const newSettings = { ...data.widget_settings, size: val };
                                                    setData('widget_settings', newSettings);
                                                    saveWidgetSettings(newSettings);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="widget_card_bg">Card Background</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="widget_card_bg"
                                                    type="color"
                                                    value={data.widget_settings?.cardBackground || '#FFFFFF'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, cardBackground: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    className="h-10 w-20 p-1"
                                                />
                                                <Input
                                                    type="text"
                                                    value={data.widget_settings?.cardBackground || '#FFFFFF'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, cardBackground: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    placeholder="#FFFFFF"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="widget_text_color">Text Color</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="widget_text_color"
                                                    type="color"
                                                    value={data.widget_settings?.textColor || '#000000'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, textColor: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    className="h-10 w-20 p-1"
                                                />
                                                <Input
                                                    type="text"
                                                    value={data.widget_settings?.textColor || '#000000'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, textColor: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    placeholder="#000000"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="widget_border_radius">Border Radius (px)</Label>
                                            <Input
                                                id="widget_border_radius"
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={data.widget_settings?.borderRadius || '8'}
                                                onChange={(e) => {
                                                    const newSettings = { ...data.widget_settings, borderRadius: e.target.value };
                                                    setData('widget_settings', newSettings);
                                                    saveWidgetSettings(newSettings);
                                                }}
                                                placeholder="8"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="widget_padding">Padding (px)</Label>
                                            <Input
                                                id="widget_padding"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={data.widget_settings?.padding || '24'}
                                                onChange={(e) => {
                                                    const newSettings = { ...data.widget_settings, padding: e.target.value };
                                                    setData('widget_settings', newSettings);
                                                    saveWidgetSettings(newSettings);
                                                }}
                                                placeholder="24"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Advanced Styling */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold">Advanced Styling</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_border_color">Border Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="widget_border_color"
                                                        type="color"
                                                        value={data.widget_settings?.borderColor || '#E5E7EB'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, borderColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        className="h-10 w-20 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.widget_settings?.borderColor || '#E5E7EB'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, borderColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        placeholder="#E5E7EB"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_input_bg">Input Background</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="widget_input_bg"
                                                        type="color"
                                                        value={data.widget_settings?.inputBackground || '#FFFFFF'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, inputBackground: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        className="h-10 w-20 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.widget_settings?.inputBackground || '#FFFFFF'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, inputBackground: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        placeholder="#FFFFFF"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_input_border">Input Border Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="widget_input_border"
                                                        type="color"
                                                        value={data.widget_settings?.inputBorderColor || '#D1D5DB'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, inputBorderColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        className="h-10 w-20 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.widget_settings?.inputBorderColor || '#D1D5DB'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, inputBorderColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        placeholder="#D1D5DB"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_input_text">Input Text Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="widget_input_text"
                                                        type="color"
                                                        value={data.widget_settings?.inputTextColor || '#000000'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, inputTextColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        className="h-10 w-20 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.widget_settings?.inputTextColor || '#000000'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, inputTextColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        placeholder="#000000"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_button_radius">Button Border Radius (px)</Label>
                                                <Input
                                                    id="widget_button_radius"
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    value={data.widget_settings?.buttonBorderRadius || '6'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, buttonBorderRadius: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    placeholder="6"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_button_font">Button Font Size (px)</Label>
                                                <Input
                                                    id="widget_button_font"
                                                    type="number"
                                                    min="10"
                                                    max="24"
                                                    value={data.widget_settings?.buttonFontSize || '14'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, buttonFontSize: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    placeholder="14"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_label_font">Label Font Size (px)</Label>
                                                <Input
                                                    id="widget_label_font"
                                                    type="number"
                                                    min="10"
                                                    max="24"
                                                    value={data.widget_settings?.labelFontSize || '14'}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, labelFontSize: e.target.value };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    placeholder="14"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_label_weight">Label Font Weight</Label>
                                                <FormSelect
                                                    options={[
                                                        { value: '400', label: 'Normal' },
                                                        { value: '500', label: 'Medium' },
                                                        { value: '600', label: 'Semi Bold' },
                                                        { value: '700', label: 'Bold' },
                                                    ]}
                                                    value={data.widget_settings?.labelFontWeight || '500'}
                                                    onChange={(val) => {
                                                        const newSettings = { ...data.widget_settings, labelFontWeight: val };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_service_hover">Service Card Hover Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="widget_service_hover"
                                                        type="color"
                                                        value={data.widget_settings?.serviceCardHoverColor || '#F3F4F6'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, serviceCardHoverColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        className="h-10 w-20 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.widget_settings?.serviceCardHoverColor || '#F3F4F6'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, serviceCardHoverColor: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        placeholder="#F3F4F6"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_summary_bg">Summary Background</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="widget_summary_bg"
                                                        type="color"
                                                        value={data.widget_settings?.summaryBackground || '#F9FAFB'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, summaryBackground: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        className="h-10 w-20 p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.widget_settings?.summaryBackground || '#F9FAFB'}
                                                        onChange={(e) => {
                                                            const newSettings = { ...data.widget_settings, summaryBackground: e.target.value };
                                                            setData('widget_settings', newSettings);
                                                            saveWidgetSettings(newSettings);
                                                        }}
                                                        placeholder="#F9FAFB"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_font_family">Font Family</Label>
                                                <FormSelect
                                                    options={[
                                                        { value: 'default', label: 'Default' },
                                                        { value: 'Inter', label: 'Inter' },
                                                        { value: 'Roboto', label: 'Roboto' },
                                                        { value: 'Open Sans', label: 'Open Sans' },
                                                        { value: 'Lato', label: 'Lato' },
                                                        { value: 'Montserrat', label: 'Montserrat' },
                                                        { value: 'Poppins', label: 'Poppins' },
                                                    ]}
                                                    value={!data.widget_settings?.fontFamily || data.widget_settings?.fontFamily === '' ? 'default' : data.widget_settings.fontFamily}
                                                    onChange={(val) => {
                                                        const newSettings = { ...data.widget_settings, fontFamily: val === 'default' ? '' : val };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="widget_box_shadow">Box Shadow</Label>
                                                <FormSelect
                                                    options={[
                                                        { value: 'none', label: 'None' },
                                                        { value: 'sm', label: 'Small' },
                                                        { value: 'md', label: 'Medium' },
                                                        { value: 'lg', label: 'Large' },
                                                    ]}
                                                    value={data.widget_settings?.boxShadow || 'md'}
                                                    onChange={(val) => {
                                                        const newSettings = { ...data.widget_settings, boxShadow: val };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Payment Configuration */}
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <Label className="text-sm font-semibold">Payment Requirement</Label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Choose whether customers must pay upfront or can request bookings without payment
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {savingWidget && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                                <input
                                                    type="checkbox"
                                                    id="widget_require_payment"
                                                    checked={data.widget_settings?.requirePayment !== false}
                                                    onChange={(e) => {
                                                        const newSettings = { ...data.widget_settings, requirePayment: e.target.checked };
                                                        setData('widget_settings', newSettings);
                                                        saveWidgetSettings(newSettings);
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                    disabled={savingWidget}
                                                />
                                                <Label htmlFor="widget_require_payment" className="cursor-pointer text-sm">
                                                    Require Payment
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p>• <strong>Enabled:</strong> Customers must have sufficient wallet balance to book</p>
                                            <p>• <strong>Disabled:</strong> Customers can request bookings without payment (you'll review and confirm)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Embed Code */}
                                {profile?.slug && (
                                    <div className="space-y-2">
                                        <Label>Embed Code</Label>
                                        <div className="flex items-center gap-2">
                                            <Textarea
                                                readOnly
                                                value={`<script src="${window.location.origin}/js/widget.js" data-slug="${profile.slug}" data-color="${data.widget_settings?.primaryColor || '#3B82F6'}" data-size="${data.widget_settings?.size || 'medium'}"></script>`}
                                                className="font-mono text-xs"
                                                rows={3}
                                            />
                                            <CopyEmbedCodeButton 
                                                code={`<script src="${window.location.origin}/js/widget.js" data-slug="${profile.slug}" data-color="${data.widget_settings?.primaryColor || '#3B82F6'}" data-size="${data.widget_settings?.size || 'medium'}"></script>`}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Copy this code and paste it into your website's HTML where you want the booking widget to appear.
                                            <br />
                                            <strong>Note:</strong> Customization settings (colors, backgrounds, etc.) are automatically applied from your widget settings.
                                        </p>
                                    </div>
                                )}

                                {/* Preview */}
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    {!data.widget_enabled && (
                                        <div className="mb-2 rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:bg-yellow-950/20">
                                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                                Preview mode: Enable the widget above to make it live on your website.
                                            </p>
                                        </div>
                                    )}
                                    <div className="rounded-lg border p-4 bg-background">
                                        <iframe
                                            src={`${window.location.origin}/widget/${profile?.slug}?color=${encodeURIComponent(data.widget_settings?.primaryColor || '#3B82F6')}&size=${data.widget_settings?.size || 'medium'}&cardBg=${encodeURIComponent(data.widget_settings?.cardBackground || '#FFFFFF')}&textColor=${encodeURIComponent(data.widget_settings?.textColor || '#000000')}&borderRadius=${data.widget_settings?.borderRadius || '8'}&padding=${data.widget_settings?.padding || '24'}&borderColor=${encodeURIComponent(data.widget_settings?.borderColor || '#E5E7EB')}&inputBg=${encodeURIComponent(data.widget_settings?.inputBackground || '#FFFFFF')}&inputBorder=${encodeURIComponent(data.widget_settings?.inputBorderColor || '#D1D5DB')}&inputText=${encodeURIComponent(data.widget_settings?.inputTextColor || '#000000')}&buttonRadius=${data.widget_settings?.buttonBorderRadius || '6'}&buttonFont=${data.widget_settings?.buttonFontSize || '14'}&labelFont=${data.widget_settings?.labelFontSize || '14'}&labelWeight=${data.widget_settings?.labelFontWeight || '500'}&serviceHover=${encodeURIComponent(data.widget_settings?.serviceCardHoverColor || '#F3F4F6')}&summaryBg=${encodeURIComponent(data.widget_settings?.summaryBackground || '#F9FAFB')}&fontFamily=${encodeURIComponent(data.widget_settings?.fontFamily || '')}&boxShadow=${data.widget_settings?.boxShadow || 'md'}`}
                                            className="w-full h-[600px] border-0 rounded"
                                            title="Widget Preview"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

// Copy embed code button component
function CopyEmbedCodeButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
        >
            {copied ? (
                <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                </>
            ) : (
                <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                </>
            )}
        </Button>
    );
}

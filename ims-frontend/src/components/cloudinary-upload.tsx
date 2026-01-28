'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface CloudinaryUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    disabled?: boolean;
}

export default function CloudinaryUpload({
    value,
    onChange,
    onRemove,
    disabled = false,
}: CloudinaryUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        return (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-sm text-destructive">
                    Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
                    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {value ? (
                <div className="relative rounded-lg border bg-background p-4">
                    <div className="relative w-full h-[300px] overflow-hidden rounded-lg bg-muted">
                        <Image
                            src={value}
                            alt="Product image"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <CldUploadWidget
                            uploadPreset={uploadPreset}
                            options={{
                                maxFiles: 1,
                                resourceType: 'image',
                                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
                                maxFileSize: 2000000, // 2MB
                            }}
                            onSuccess={(result: any) => {
                                setIsUploading(false);
                                if (result?.info?.secure_url) {
                                    onChange(result.info.secure_url);
                                }
                            }}
                            onClose={() => setIsUploading(false)}
                            onQueuesEnd={() => setIsUploading(false)}
                        >
                            {({ open }) => (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsUploading(true);
                                        open();
                                    }}
                                    disabled={disabled || isUploading}
                                >
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    {isUploading ? 'Uploading...' : 'Change Image'}
                                </Button>
                            )}
                        </CldUploadWidget>
                        {onRemove && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onRemove}
                                disabled={disabled}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <CldUploadWidget
                    uploadPreset={uploadPreset}
                    options={{
                        maxFiles: 1,
                        resourceType: 'image',
                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
                        maxFileSize: 2000000, // 2MB
                    }}
                    onSuccess={(result: any) => {
                        setIsUploading(false);
                        if (result?.info?.secure_url) {
                            onChange(result.info.secure_url);
                        }
                    }}
                    onClose={() => setIsUploading(false)}
                    onQueuesEnd={() => setIsUploading(false)}
                >
                    {({ open }) => (
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => {
                                if (!disabled) {
                                    setIsUploading(true);
                                    open();
                                }
                            }}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-primary/10">
                                    {isUploading ? (
                                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                    ) : (
                                        <ImageIcon className="h-12 w-12 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {isUploading ? (
                                            'Uploading...'
                                        ) : (
                                            <>
                                                <span className="text-primary">Click to upload</span> or drag and drop
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPEG, PNG, WEBP or SVG (max. 2MB)
                                    </p>
                                </div>
                                {!isUploading && (
                                    <Button type="button" disabled={disabled}>
                                        Browse Files
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CldUploadWidget>
            )}
        </div>
    );
}

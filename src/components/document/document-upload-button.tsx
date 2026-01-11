"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { saveDocument } from "@/actions/document";
import { useTransition } from "react";

interface DocumentUploadButtonProps {
    workspaceId: string;
    projectId?: string;
    onUpload?: (document: any) => void;
}

export const DocumentUploadButton = ({ workspaceId, projectId, onUpload }: DocumentUploadButtonProps) => {
    const [isPending, startTransition] = useTransition();

    const onUploadSuccess = (result: any) => {
        const info = result.info;

        startTransition(() => {
            saveDocument(workspaceId, {
                name: info.original_filename || "Untitled",
                url: info.secure_url,
                fileType: info.format,
                size: info.bytes,
                projectId: projectId,
            }).then((data) => {
                if (data.success && onUpload) {
                    onUpload(data.document);
                } else if (data.error) {
                    alert(data.error);
                }
            });
        });
    };

    return (
        <CldUploadWidget
            onSuccess={onUploadSuccess}
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "workspace_pro"}
        >
            {({ open }) => {
                return (
                    <Button onClick={() => open()} disabled={isPending}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                );
            }}
        </CldUploadWidget>
    );
};

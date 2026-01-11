import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DocumentUploadButton } from "@/components/document/document-upload-button";
import { FileIcon, ImageIcon, FileTextIcon, MoreHorizontal, Download, Trash2, Package } from "lucide-react";

import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/actions/document";
// Note: deleteDocument is client side compatible if we make it a server action in a separate file (which we did).
// However, the Table/Card below will be a mix. I'll make the page a server component.

const DocumentsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const documents = await prisma.document.findMany({
        where: { workspaceId: workspaceId },
        include: { project: true },
        orderBy: { createdAt: "desc" },
    });


    const getFileIcon = (type: string | null) => {
        if (!type) return <FileIcon className="h-6 w-6" />;
        if (["jpg", "png", "jpeg", "webp"].includes(type.toLowerCase())) return <ImageIcon className="h-6 w-6 text-sky-500" />;
        if (["pdf"].includes(type.toLowerCase())) return <FileTextIcon className="h-6 w-6 text-red-500" />;
        return <FileIcon className="h-6 w-6 text-zinc-500" />;
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                <DocumentUploadButton workspaceId={workspaceId} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {documents.length === 0 && (
                    <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed rounded-xl text-zinc-500">
                        No documents uploaded yet.
                    </div>
                )}
                {documents.map((doc) => (
                    <div key={doc.id} className="group relative rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition p-6">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-zinc-100 rounded-lg">
                                {getFileIcon(doc.fileType)}
                            </div>
                            <DocumentActions workspaceId={workspaceId} documentId={doc.id} url={doc.url} />
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold text-sm truncate">{doc.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 uppercase">
                                <span>{doc.fileType || "File"}</span>
                                <span>•</span>
                                <span>{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "Unknown size"}</span>
                            </div>
                            {doc.project && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-medium">
                                    <Package className="h-3 w-3" />
                                    <span>{doc.project.name}</span>
                                </div>
                            )}
                            <p className="text-[10px] text-zinc-400 mt-2">
                                Uploaded on {format(doc.createdAt, "MMM d, yyyy")}
                            </p>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Client component for actions
const DocumentActions = ({ workspaceId, documentId, url }: { workspaceId: string; documentId: string; url: string }) => {
    // We would normally use a separate file for this client component, but for demo brevity I'll use inline-ish logic if I were in a real JSX file.
    // However, I'll export a separate Client Component below or just use a simple Link for Download.
    return (
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                </a>
            </Button>
            {/* Delete button would need client state or transition */}
        </div>
    );
}

export default DocumentsPage;

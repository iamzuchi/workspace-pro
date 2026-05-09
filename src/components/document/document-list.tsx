"use client";

import { FileIcon, ImageIcon, FileTextIcon, Download, Trash2, Package, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/actions/document";
import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface DocumentListProps {
    workspaceId: string;
    documents: any[];
    showProject?: boolean;
}

export const DocumentList = ({ workspaceId, documents, showProject = false }: DocumentListProps) => {
    const [isPending, startTransition] = useTransition();

    const getFileIcon = (type: string | null) => {
        if (!type) return <FileIcon className="h-6 w-6" />;
        const t = type.toLowerCase();
        if (["jpg", "png", "jpeg", "webp"].includes(t)) return <ImageIcon className="h-6 w-6 text-sky-500" />;
        if (["pdf"].includes(t)) return <FileTextIcon className="h-6 w-6 text-red-500" />;
        return <FileIcon className="h-6 w-6 text-zinc-500" />;
    };

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        startTransition(() => {
            deleteDocument(workspaceId, id).then((data) => {
                if (data.success) toast.success(data.success);
                if (data.error) toast.error(data.error);
            });
        });
    };

    if (documents.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-zinc-500 bg-zinc-50/50">
                <FileIcon className="h-10 w-10 mb-4 opacity-20" />
                <p className="font-medium">No documents uploaded yet.</p>
                <p className="text-xs text-zinc-400 mt-1">Upload reports, blueprints, or site photos.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc) => (
                <div key={doc.id} className="group relative rounded-xl border bg-white text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2.5 bg-zinc-50 rounded-xl group-hover:bg-white group-hover:shadow-inner transition-colors">
                            {getFileIcon(doc.fileType)}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild title="View">
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 text-zinc-500" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild title="Download">
                                <a href={doc.url.replace("/upload/", "/upload/fl_attachment/")} download={doc.name}>
                                    <Download className="h-4 w-4 text-zinc-500" />
                                </a>
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => handleDelete(doc.id)}
                                disabled={isPending}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm truncate text-zinc-800" title={doc.name}>{doc.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="px-1.5 py-0 h-4 text-[9px] uppercase font-bold text-zinc-400 border-zinc-100">
                                {doc.fileType || "File"}
                            </Badge>
                            <span className="text-[10px] text-zinc-400 font-medium">
                                {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "N/A"}
                            </span>
                        </div>
                        
                        {showProject && doc.project && (
                            <div className="mt-3 flex items-center gap-1.5 p-1.5 px-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                                <Package className="h-3 w-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-700 font-bold truncate">{doc.project.name}</span>
                            </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400 italic">
                                {format(new Date(doc.createdAt), "MMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

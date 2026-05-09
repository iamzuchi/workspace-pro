import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DocumentUploadButton } from "@/components/document/document-upload-button";
import { DocumentList } from "@/components/document/document-list";

const DocumentsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const documents = await prisma.document.findMany({
        where: { workspaceId: workspaceId },
        include: { project: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                    <p className="text-sm text-zinc-500 italic mt-1">Access all files uploaded across all your projects.</p>
                </div>
                <DocumentUploadButton workspaceId={workspaceId} />
            </div>

            <div className="pt-4">
                <DocumentList workspaceId={workspaceId} documents={documents} showProject={true} />
            </div>
        </div>
    );
};

export default DocumentsPage;

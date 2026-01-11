import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InvoiceDetailsContainer } from "@/components/invoice/invoice-details-container";
import { InvoiceHistory } from "@/components/invoice/invoice-history";
import { Role } from "@prisma/client";
import { serializeDecimal } from "@/lib/utils";

const InvoiceDetailsPage = async ({
    params
}: {
    params: Promise<{ workspaceId: string; invoiceId: string }>
}) => {
    const { workspaceId, invoiceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const invoice = await prisma.invoice.findUnique({
        where: {
            id: invoiceId,
            workspaceId: workspaceId,
        },
        include: {
            items: true,
            contractor: true,
            project: true,
            team: true,
            activities: {
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
    });

    if (!invoice) redirect(`/${workspaceId}/finance?tab=invoices`);

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId }
    });

    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: workspaceId,
                userId: user.id!
            }
        }
    });

    const canSeeHistory = member?.role === Role.ADMIN || member?.role === Role.ACCOUNTANT;

    const serializedInvoice = serializeDecimal(invoice);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 max-w-5xl mx-auto">
            <InvoiceDetailsContainer
                workspace={workspace}
                invoice={serializedInvoice}
                workspaceId={workspaceId}
            />
            {canSeeHistory && (
                <InvoiceHistory activities={serializedInvoice.activities} />
            )}
        </div>
    );
};


export default InvoiceDetailsPage;

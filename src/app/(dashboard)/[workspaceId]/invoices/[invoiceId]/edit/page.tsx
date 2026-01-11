import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { serializeDecimal } from "@/lib/utils";

const InvoiceEditPage = async ({
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
        }
    });

    if (!invoice) redirect(`/${workspaceId}/finance?tab=invoices`);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 max-w-5xl mx-auto">
            <InvoiceForm
                initialData={serializeDecimal(invoice)}
                invoiceId={invoiceId}
            />
        </div>
    );
};

export default InvoiceEditPage;

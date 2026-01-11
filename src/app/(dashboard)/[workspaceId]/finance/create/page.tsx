import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InvoiceForm } from "@/components/invoice/invoice-form";

const CreateInvoicePage = async () => {
    const user = await currentUser();
    if (!user) redirect("/login");

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <InvoiceForm />
        </div>
    );
};
export default CreateInvoicePage;

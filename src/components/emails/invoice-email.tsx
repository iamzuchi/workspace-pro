import * as React from "react";

interface InvoiceEmailProps {
    workspaceName: string;
    invoiceNumber: string;
    totalAmount: string;
    viewLink: string;
}

export const InvoiceEmail: React.FC<Readonly<InvoiceEmailProps>> = ({
    workspaceName,
    invoiceNumber,
    totalAmount,
    viewLink,
}) => (
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#333" }}>
        <h1 style={{ color: "#111" }}>New Invoice from {workspaceName}</h1>
        <p>You have received a new invoice.</p>
        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", margin: "20px 0" }}>
            <p><strong>Invoice Number:</strong> #{invoiceNumber}</p>
            <p><strong>Total Amount:</strong> ${totalAmount}</p>
        </div>
        <a
            href={viewLink}
            style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold"
            }}
        >
            View Invoice
        </a>
        <p style={{ marginTop: "30px", fontSize: "12px", color: "#888" }}>
            If you have any questions, please contact {workspaceName} directly.
        </p>
    </div>
);

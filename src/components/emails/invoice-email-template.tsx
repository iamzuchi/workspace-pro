import * as React from 'react';

interface InvoiceEmailTemplateProps {
    invoiceNumber: string;
    amount: string;
    downloadLink?: string; // Optional if we had a hosted link
}

export const InvoiceEmailTemplate: React.FC<Readonly<InvoiceEmailTemplateProps>> = ({
    invoiceNumber,
    amount,
}) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: '1.5' }}>
        <h2>New Invoice from WorkspacePro</h2>
        <p>Hello,</p>
        <p>Please find attached invoice <strong>{invoiceNumber}</strong> for <strong>{amount}</strong>.</p>
        <p>If you have any questions, please reply to this email.</p>
        <br />
        <p>Best regards,</p>
        <p>The WorkspacePro Team</p>
    </div>
);

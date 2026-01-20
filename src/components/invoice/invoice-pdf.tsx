import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 12,
        fontFamily: 'Helvetica',
        color: '#000', // Changed to black
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#000', // Thicker/Black border
        paddingBottom: 20,
    },
    logoContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    logoImage: {
        width: 50,
        height: 50,
        marginBottom: 10,
        objectFit: 'contain',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 10,
        color: '#000', // Changed to black
        marginBottom: 4,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 12,
        marginBottom: 10,
        color: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    col: {
        flex: 1,
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    th: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#000',
    },
    td: {
        fontSize: 11,
        color: '#000',
    },
    description: {
        flex: 3,
    },
    qty: {
        flex: 1,
        textAlign: 'center',
    },
    price: {
        flex: 1,
        textAlign: 'right',
    },
    amount: {
        flex: 1,
        textAlign: 'right',
    },
    totals: {
        marginTop: 30,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        marginBottom: 8,
        width: 200,
        justifyContent: 'space-between',
    },
    totalLabel: {
        fontSize: 11,
        color: '#000',
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000',
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 8,
    },
    notes: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    notesLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    notesText: {
        fontSize: 10,
        color: '#000',
    },
    footer: {
        marginTop: 50,
        textAlign: 'center',
        fontSize: 10,
        color: '#000',
        fontWeight: 'bold',
    },
    watermark: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#888',
    }
});

interface InvoicePDFProps {
    invoice: any;
}

const formatCurrency = (amount: number | string, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(Number(amount));
};

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
    // Determine Bill To Name
    const billToName = invoice.recipientName
        ? invoice.recipientName
        : (invoice.contractor ? invoice.contractor.companyName : "Client Name");

    const billToEmail = invoice.recipientEmail
        ? invoice.recipientEmail
        : (invoice.contractor ? invoice.contractor.email : "");

    const currency = invoice.currency || 'USD';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {invoice.workspace.logo && (
                            <Image src={invoice.workspace.logo} style={styles.logoImage} />
                        )}
                        <Text style={styles.logoText}>{invoice.workspace.name || "WorkspacePro"}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.title}>INVOICE</Text>
                        <Text style={styles.label}>Invoice Number</Text>
                        <Text style={styles.value}>{invoice.number}</Text>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</Text>
                    </View>
                </View>

                {/* Client & Project Info */}
                <View style={styles.grid}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Bill To:</Text>
                        <Text style={{ fontWeight: 'bold' }}>{billToName}</Text>
                        {billToEmail && <Text>{billToEmail}</Text>}
                        {invoice.contractor?.contactName && invoice.contractor.contactName !== billToName && (
                            <Text>{invoice.contractor.contactName}</Text>
                        )}
                    </View>
                    <View style={styles.col}>
                        {invoice.project && (
                            <>
                                <Text style={styles.label}>Project:</Text>
                                <Text>{invoice.project.name}</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.description]}>Description</Text>
                        <Text style={[styles.th, styles.qty]}>Qty</Text>
                        <Text style={[styles.th, styles.price]}>Unit Price</Text>
                        <Text style={[styles.th, styles.amount]}>Amount</Text>
                    </View>

                    {invoice.items?.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[styles.td, styles.description]}>{item.description}</Text>
                            <Text style={[styles.td, styles.qty]}>{item.quantity}</Text>
                            <Text style={[styles.td, styles.price]}>{formatCurrency(item.unitPrice, currency)}</Text>
                            <Text style={[styles.td, styles.amount]}>{formatCurrency(item.amount, currency)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.totalAmount, currency)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tax</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount, currency)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotal]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency((Number(invoice.totalAmount) + Number(invoice.taxAmount)), currency)}</Text>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for your business!</Text>
                </View>

                {/* Watermark */}
                <Text style={styles.watermark}>Powered by Workspace Pro</Text>
            </Page>
        </Document>
    );
};

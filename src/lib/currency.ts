export const formatCurrency = (amount: number | string, currency: string = "USD") => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(value);
};

export const CURRENCY_OPTIONS = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "NGN", label: "NGN - Nigerian Naira" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
];

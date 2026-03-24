"use client";

interface DynamicThemeHandlerProps {
    color: string | null;
}

export const DynamicThemeHandler = ({ color }: DynamicThemeHandlerProps) => {
    if (!color) return null;

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
                :root {
                    --primary: ${color};
                    --sidebar-primary: ${color};
                }
                .dark {
                    --primary: ${color};
                    --sidebar-primary: ${color};
                }
            `
        }} />
    );
};

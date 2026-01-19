import DashboardLayout from "@/components/layout/AppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}

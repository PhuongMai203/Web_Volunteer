import LayoutOrg from "@/components/organization/Layout/LayoutOrganzation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['organization']}>
      <LayoutOrg>{children}</LayoutOrg>
    </ProtectedRoute>
  );
}

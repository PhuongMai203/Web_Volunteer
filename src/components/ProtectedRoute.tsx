'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, getAuth } from "firebase/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "organization" | "user")[];
}

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const auth = getAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      try {
        const accountData = localStorage.getItem("accountPageData");
        const userInfoData = localStorage.getItem("userInfo");

        let role: string | null = null;

        if (accountData) {
          const parsed = JSON.parse(accountData);
          role = parsed?.userInfo?.role || null;
        } else if (userInfoData) {
          const parsed = JSON.parse(userInfoData);
          role = parsed?.role || null;
        }

        if (!role) {
          router.push('/');
          return;
        }

        if (allowedRoles.length === 0 || allowedRoles.includes(role as "admin" | "organization" | "user")) {
          setAuthorized(true);
        } else {
          if (role === "admin") router.push("/admin/dashboard");
          else if (role === "organization") router.push("/organization/dashboard");
          else router.push("/");
        }
      } catch (error) {
        console.error("Lỗi kiểm tra quyền:", error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router, allowedRoles]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "12px",
        fontSize: "18px",
        color: "#333"
      }}>
        <div style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid rgb(219, 91, 52)",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite"
        }} />
        <p>Đang kiểm tra quyền truy cập...</p>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}

"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import Header from "@/components/user/Layout/Header";
import Footer from "@/components/user/Layout/Footer";
import Banner from "@/components/user/Layout/Banner";
import ChatBox from "@/components/user/Common/ChatBox";

interface PageTransitionWrapperProps {
  children: ReactNode;
}

export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();

  if (!pathname) return null;

  const isAdminPage = pathname.startsWith("/admin");
  const isOrganizationPage = pathname.startsWith("/organization");
  const isContactPage = pathname === "/contact" || pathname === "/signin" || pathname === "/account";
  const isPrivacyPage = pathname === "/account/privacy";
  const showBanner = pathname === "/" || pathname === "/campaigns";

  if (isAdminPage) {
    return <div className="admin-layout">{children}</div>;
  }

  if (isOrganizationPage) {
    return <div className="organization-layout">{children}</div>;
  }

  return (
    <>
      {!isPrivacyPage && <Header />}

      {isContactPage ? (
        <div className="w-full min-h-screen overflow-hidden">{children}</div>
      ) : (
        <div className="flex">
          <main className="flex-1 p-6">
            {showBanner && <Banner />}
            <div className="mt-10">{children}</div>
          </main>
        </div>
      )}

      <Footer />
      <ChatBox />
    </>
  );
}

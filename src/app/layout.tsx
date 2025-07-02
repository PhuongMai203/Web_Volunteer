import type { Metadata } from "next";
import "./globals.css";
import ClientLayoutWrapper from "@/components/user/Layout/PageTransitionWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "HelpConnect",
  description: "Kết nối tình nguyện viên với cộng đồng",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased bg-orange-50">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        
        {/* Hiển thị toast giữa màn hình, tự đóng sau 3s, màu sắc theo loại */}
        <ToastContainer 
          position="top-center" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="colored" 
        />
      </body>
    </html>
  );
}


//layout ini bertujuan untuk membuat layout yang konsisten di seluruh aplikasi, dengan menempatkan komponen SideBar di sebelah kiri dan konten utama di sebelah kanan. Dengan menggunakan layout ini, kita dapat memastikan bahwa semua halaman dalam aplikasi memiliki tampilan yang seragam dan mudah dinavigasi. dan untuk halamanan yang tidak menggunakan layout ini, kita bisa menggunakan layout yang berbeda atau tidak menggunakan layout sama sekali, tergantung pada kebutuhan halaman tersebut, seperti halaman login dan registrasi atau halaman error yang mungkin tidak memerlukan sidebar.

import SideBar from "@/components/shared/SideBar";
import Navbar from "@/components/shared/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

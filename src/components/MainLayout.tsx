
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      <div className="fixed h-screen z-50">
        <Sidebar />
      </div>
      <div className="flex-1 ml-[60px]">
        <Header />
        <main className="flex-1 p-6 pt-24 overflow-y-auto min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
};


import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

"use client";

import { ProjectProvider } from "../context/ProjectProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ProjectProvider>
        <main className="">{children}</main>
      </ProjectProvider>
    </div>
  );
}

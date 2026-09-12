"use client";

import { ProjectProvider } from "../context/ProjectProvider";
import { BoardContainer } from "../components/ui/BoardContainer";

export default function DemoPage() {
  return (
    <ProjectProvider>
      <BoardContainer />
    </ProjectProvider>
  );
}

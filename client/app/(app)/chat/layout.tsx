import { Metadata } from "next";

export const metadata: Metadata = { title: "AI Consultant" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

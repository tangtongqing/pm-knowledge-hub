import type { Metadata } from "next";
import { KineticShowcase } from "../page";

export const metadata: Metadata = {
  title: "设计实验｜PM Knowledge Hub",
  description: "PM Knowledge Hub 的动态品牌与产品叙事实验页。",
};

export default function DesignPage() {
  return <KineticShowcase />;
}

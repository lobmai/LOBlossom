import { redirect } from "next/navigation";

export default function LegacyCompletePage() {
  redirect("/lesson/1/save");
}

import { Metadata } from "next";
import RegisterPage from "./RegisterPage";

export const metadata: Metadata = {
  title: "�ang k� t�c gi? | VStory",
  description: "Tr? th�nh t�c gi? tr�n VStory � Chia s? c�u chuy?n v� ki?m thu nh?p t? dam m� vi?t l�ch.",
};

export default function Page() {
  return <RegisterPage />;
}

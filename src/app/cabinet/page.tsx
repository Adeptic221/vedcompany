import type { Metadata } from "next";
import CabinetClient from "./CabinetClient";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description:
    "Личный кабинет ВЭД: заказы, избранное, документы, чат с менеджером и отслеживание доставки автомобиля.",
  alternates: {
    canonical: "/cabinet",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CabinetPage() {
  return <CabinetClient />;
}
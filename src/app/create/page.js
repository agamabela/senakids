import CreateClient from "./CreateClient";

export const metadata = {
  title: "Studio Kreasi & Kanvas Menggambar Anak",
  description:
    "Kanvas menggambar digital interaktif untuk anak mengekspresikan imajinasi dan kreativitas dengan berbagai warna dan kuas.",
  alternates: {
    canonical: "/create",
  },
  openGraph: {
    title: "Studio Kreasi & Kanvas Menggambar Anak",
    description:
      "Kanvas menggambar digital interaktif untuk anak mengekspresikan imajinasi dan kreativitas dengan berbagai warna dan kuas.",
    url: "https://senakids.web.id/create",
    type: "website",
  },
};

export default function CreatePage() {
  return <CreateClient />;
}

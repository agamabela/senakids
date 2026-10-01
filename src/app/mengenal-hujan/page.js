import MengenalHujanClient from "./MengenalHujanClient";

export const metadata = {
  title: "Mengenal Hujan - Proses Terjadinya Hujan",
  description:
    "Penjelasan sains ramah anak mengenai tahap-tahap terjadinya hujan: penguapan, kondensasi, awan, dan presipitasi.",
  alternates: {
    canonical: "/mengenal-hujan",
  },
  openGraph: {
    title: "Mengenal Hujan - Proses Terjadinya Hujan",
    description:
      "Penjelasan sains ramah anak mengenai tahap-tahap terjadinya hujan: penguapan, kondensasi, awan, dan presipitasi.",
    url: "https://senakids.web.id/mengenal-hujan",
    type: "article",
  },
};

export default function MengenalHujanPage() {
  return <MengenalHujanClient />;
}
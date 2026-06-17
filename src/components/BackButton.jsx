"use client";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./BackButton.module.css";

export default function BackButton() {
  const router = useRouter();

  const handleBack = async () => {
    const result = await Swal.fire({
      title: 'Kembali ke Home?',
      text: "Apakah Anda ingin kembali ke halaman utama?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, kembali!',
      cancelButtonText: 'Tidak',
      confirmButtonColor: '#8BA888',
      cancelButtonColor: '#C87A65',
      background: '#FAF6F0',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        title: 'text-xl font-heading text-text',
        htmlContainer: 'text-base font-body text-text',
      },
    });

    if (result.isConfirmed) {
      router.push('/home');
    }
  };

  return (
    <button onClick={handleBack} className={styles.backButton}>
      <span className={styles.icon}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      Back
    </button>
  );
}
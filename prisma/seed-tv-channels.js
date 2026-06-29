const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auto-generated: all embeddable videos harvested from official YouTube channels
// Shimajiro Club Indonesia (UCTu0mh8zi8kb5V_9E1y2FCQ) and
// Shaun the Sheep Official (UCNnEOqN2qcxeSQzBimv7h7Q).
// Videos that disable embedding were excluded (they cannot play off YouTube).
const videos = [
  {
    "title": "Kompilasi: Dunia Fantasi | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "v7WoGDUHZGM"
  },
  {
    "title": "Kompilasi: Mendaki Gunung | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Zb0xGARt1MU"
  },
  {
    "title": "Judul: Kompilasi: Di Sekolah #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "a-7zt8wf5E0"
  },
  {
    "title": "Kompilasi: Bersama Teman | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "LUjJWfH-Q4o"
  },
  {
    "title": "Kompilasi: Keluargaku | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "n1SCCUGUD4s"
  },
  {
    "title": "Judul: Kompilasi: Belajar Bersama #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "tJTPXwKhDfM"
  },
  {
    "title": "Kompilasi: Sayang Ayah | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "8sqPLXAtpLE"
  },
  {
    "title": "Judul: Kompilasi: Aku Sayang Ibu #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Hbr1rYWKxME"
  },
  {
    "title": "Kompilasi: Petualangan Kecilku | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "_3v4ZAo-f8s"
  },
  {
    "title": "Kompilasi: Di Sekolah | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "VJdo_JWn82c"
  },
  {
    "title": "Kompilasi: Berteman Baik | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "WCmcIilmRRE"
  },
  {
    "title": "Kompilasi: Belajar Bersama | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "U6WTlkv2AK4"
  },
  {
    "title": "Kompilasi: Ayah dan Ibu | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "L51B8hKhmOs"
  },
  {
    "title": "Judul: Kompilasi: Pergi Menginap #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "xRdgPWaRqH8"
  },
  {
    "title": "Kompilasi: Pantang Menyerah | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "8mH_rvsHmOI"
  },
  {
    "title": "Kompilasi: Sepak Bola | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "RWOmajUXbN8"
  },
  {
    "title": "Judul: Kompilasi: Pergi Piknik #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "unLWg16bUaE"
  },
  {
    "title": "Kompilasi: Berbagi dan Rasa Terima kasih | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "SGoeLbhj0v8"
  },
  {
    "title": "Kompilasi: Petualangan Bersama Teman | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "4Xq4HVqrHLw"
  },
  {
    "title": "Judul: Kompilasi: Melihat Bunga #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Ard8NWO_apw"
  },
  {
    "title": "Kompilasi: Aku Sayang Ibu | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "71kcXedbjjY"
  },
  {
    "title": "Kompilasi: Sayangi Alam | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "MG5tjq4DqjE"
  },
  {
    "title": "Judul: Kompilasi Spesial: Nikki #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "8lDaVwU8cDw"
  },
  {
    "title": "Kompilasi: Ulang Tahun | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Uu9_Oy3LLK4"
  },
  {
    "title": "Kompilasi: Sayang Keluarga | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "lt1QNxil27s"
  },
  {
    "title": "Judul: Kompilasi: Membeli Camilan #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "QJ4RF54lOdI"
  },
  {
    "title": "Kompilasi: Pergi Menginap | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "OVFOCzPbW8U"
  },
  {
    "title": "Kompilasi: Bermain Bersama | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "bYn3fMgfqAM"
  },
  {
    "title": "Kompilasi: Pergi Piknik | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Mdr01EIjpt8"
  },
  {
    "title": "Judul: Kompilasi Spesial: Nikki #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "BotTj9AMhy8"
  },
  {
    "title": "Kompilasi: Bunga Sakura | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "-feJ0JhqS5k"
  },
  {
    "title": "Judul: Kompilasi Spesial: Hutan #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "PsVi2QJMZpE"
  },
  {
    "title": "Kompilasi: Melihat Bunga | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "6OQ9oLLQgv0"
  },
  {
    "title": "Kompilasi: Seni Rupa | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "fCxpSkImsCA"
  },
  {
    "title": "Judul: Kompilasi: Festival Seru #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Y8otVkK1Qzc"
  },
  {
    "title": "Kompilasi Spesial: Nikki | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "_Iao9a0_IEc"
  },
  {
    "title": "Kompilasi Spesial: Hana | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "2UjWu-CK6aE"
  },
  {
    "title": "Kompilasi: Membeli Camilan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "txZvoffsynI"
  },
  {
    "title": "Kompilasi Spesial: Menonton Film | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "JhXvEJSIAVk"
  },
  {
    "title": "Kompilasi: Bermain Drama | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "UxaMRKAEasA"
  },
  {
    "title": "Kompilasi: Musim Semi | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "uehUqPdtPSw"
  },
  {
    "title": "Kompilasi Spesial: Hutan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "zpSWiNvLX3U"
  },
  {
    "title": "Kompilasi Spesial: Toko Roti Enak | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "HWvs4lbQkTk"
  },
  {
    "title": "Judul: Kompilasi: Anak Perempuan #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Oz8tabo5awc"
  },
  {
    "title": "Kompilasi: Festival Seru | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "GNeff4XxEFc"
  },
  {
    "title": "Kompilasi: Keluarga dan Teman | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "ykKt02ylfAA"
  },
  {
    "title": "Judul: Kompilasi: Jagalah Kesehatan 2 #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "DOGTedJ-t3s"
  },
  {
    "title": "Kompilasi: Anak Perempuan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "igCHnyCpN_w"
  },
  {
    "title": "Kompilasi: Jagalah Kesehatan 2 | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "bd5OWcVn9To"
  },
  {
    "title": "Judul: Kompilasi: Hari Valentine #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "8RzMEDf6a-8"
  },
  {
    "title": "Kompilasi: Jagalah Kesehatan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "B-Q7tsUTwTI"
  },
  {
    "title": "Kompilasi: Bermain Salju | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "EzztCjRai9s"
  },
  {
    "title": "Judul: Kompilasi: Senangnya Bermain Salju #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "tTFHhqbGgiw"
  },
  {
    "title": "Kompilasi: Bermain dan Belajar | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "WZvrcbnWm2w"
  },
  {
    "title": "Kompilasi: Hari Valentine | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "hldH8_f_nUw"
  },
  {
    "title": "Kompilasi: Harta Karun | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "wmHaFt0z_AY"
  },
  {
    "title": "Kompilasi: Senangnya Bermain Salju | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "0SThsmhvhHM"
  },
  {
    "title": "Judul: Kompilasi: Belajar Bersama #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "TlYiC9JDyqU"
  },
  {
    "title": "Kompilasi Spesial: Tentang Kumakki | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "nSfP8VQvqkI"
  },
  {
    "title": "Kompilasi: Mimi-Lynne | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "wlBv1kyaWQU"
  },
  {
    "title": "Kompilasi: Dinosaurus | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "WyNjIBn7FRY"
  },
  {
    "title": "Judul: Kompilasi: Sayangi Hutan #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "3LYXh1qsg2I"
  },
  {
    "title": "Kompilasi: Belajar Bersama | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "lXlF1Dvbs5A"
  },
  {
    "title": "Judul: Kompilasi Spesial: Tahun Baru #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "_7e8W4cOQsU"
  },
  {
    "title": "Kompilasi: Makanan Bergizi | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "BCXZU_YpgDs"
  },
  {
    "title": "Kompilasi: Olahraga | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "c1gHOtbrkq8"
  },
  {
    "title": "Kompilasi: Aku Suka Salju | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "rTLLlS8Gqds"
  },
  {
    "title": "Judul: Kompilasi: Musim Gugur #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "UaLBUJpQW1I"
  },
  {
    "title": "Judul: Kompilasi Spesial: Hari Perdamaian Dunia #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "h9AxfnDX3A4"
  },
  {
    "title": "Kompilasi: Sayangi Hutan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "9SB4p2XIhys"
  },
  {
    "title": "Kompilasi Spesial: Tahun Baru | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "kdv9b_e7ViM"
  },
  {
    "title": "Kompilasi Spesial: Flappie | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "nSnDpPitJR4"
  },
  {
    "title": "Kompilasi Spesial: Sayangi Alam | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "AsANPLVFd8o"
  },
  {
    "title": "Kompilasi Spesial: Hari Natal | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "n8q9Vm_mWb4"
  },
  {
    "title": "Kompilasi Lagu: Senangnya Hari Natal | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "1NKiurgvQnM"
  },
  {
    "title": "Kompilasi Spesial: Hari Ibu | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "yYb1TDuxVqA"
  },
  {
    "title": "Kompilasi: Pergi Berlibur | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "egAEr2eYsJY"
  },
  {
    "title": "Kompilasi Spesial: Liburan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "jdknDURUlxM"
  },
  {
    "title": "Kompilasi: Hari Hujan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "5y3OCDPZZ1c"
  },
  {
    "title": "Kompilasi: Kakak dan Adik | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "0fSGgABTCj4"
  },
  {
    "title": "Kompilasi Spesial: Serangga | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "qwnM-a-iu3E"
  },
  {
    "title": "Kompilasi: Alam yang Menakjubkan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "zUypP7HuS5o"
  },
  {
    "title": "Kompilasi Spesial: Guruku | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "ipueOluUPBU"
  },
  {
    "title": "Judul: Kompilasi Spesial: Pahlawan #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "uZ5ogA7AWoA"
  },
  {
    "title": "Kompilasi Spesial: Hari Anak Sedunia | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "GUrW7lI2Gek"
  },
  {
    "title": "Kompilasi Spesial: Hutan Doki-Doki | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "NJq_VFgaAjU"
  },
  {
    "title": "Kompilasi Spesial: Untuk Ayah | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "4gprnHbFkVs"
  },
  {
    "title": "Kompilasi Spesial: Indahnya Alam | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "MO5KfTYmugo"
  },
  {
    "title": "Kompilasi Spesial: Pahlawan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "FyaGon9Q_M4"
  },
  {
    "title": "Judul: Kompilasi: Bermain dengan Hana #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "TbEwlEvthME"
  },
  {
    "title": "Kompilasi: Jaga Kesehatan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "2ganFDN4fp8"
  },
  {
    "title": "Kompilasi: Musim Gugur | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "QK55Q1_UDns"
  },
  {
    "title": "Kompilasi: Pesawat Terbang | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "9Fne3fLRsA0"
  },
  {
    "title": "Kompilasi: Hari Halloween | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "vYG_d7WWGVc"
  },
  {
    "title": "Kompilasi: Pergi Ke Dokter | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "qwkadzv_9j0"
  },
  {
    "title": "Kompilasi: Bayi Lucu | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "LSFwSm4Z86s"
  },
  {
    "title": "Kompilasi Spesial: Makanan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "r8iYYGe3S04"
  },
  {
    "title": "Kompilasi: Suka Binatang | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "6Z7NBDMoW9s"
  },
  {
    "title": "Kompilasi: Ibu Guru Shikako | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "qYDA9SKoHPA"
  },
  {
    "title": "Kompilasi: Ayo Makan Sayur! | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "51JB0-6qb6g"
  },
  {
    "title": "Kompilasi: Aku Suka Kereta | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "O52dLaDt4Hs"
  },
  {
    "title": "Kompilasi: Hari Perdamaian Dunia | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "dTXfHiY0AvY"
  },
  {
    "title": "Judul: Aku Suka Buku #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "gQ4_by0Q_Vw"
  },
  {
    "title": "Kompilasi: Bermain Dengan Hana | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "KmGvT4YTNFk"
  },
  {
    "title": "Kompilasi: Aku Suka Buku | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "mGqk7926d1E"
  },
  {
    "title": "Judul: Keluarga #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "HtM5gVrEqJE"
  },
  {
    "title": "Kompilasi: Bermain di Rumah| Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "UOXZkR9bY-c"
  },
  {
    "title": "Kompilasi: Hari Hujan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "dc3PyQJex1E"
  },
  {
    "title": "Kompilasi: Keluarga | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "fgKxDFcn8D4"
  },
  {
    "title": "Yuk, Ikutan Kuis Shimajiro Berhadiah 🎁",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "M4n5ePaG3XQ"
  },
  {
    "title": "Cara ikut kuis Shimajiro",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "x5REhTaNuR8"
  },
  {
    "title": "Kompilasi: Laut | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "gkTIzj8hHbo"
  },
  {
    "title": "Kuis Shimajiro Berhadiah 🎁",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "z3htNbSTq_0"
  },
  {
    "title": "Kompilasi: Hana | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "VcZn-AmPZaA"
  },
  {
    "title": "Kompilasi: Kembali Ke Sekolah | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "lHrHS8bWOU4"
  },
  {
    "title": "Kompilasi: Persahabatan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "kNMB6RIAXng"
  },
  {
    "title": "Kompilasi: Liburan Musim Panas | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "kfVAQD5Y7Rc"
  },
  {
    "title": "Ada kejutan apa ya dari Shimajiro? Tunggu tanggal mainnya! #subscribe #shimajiro #kuis",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "sgMaHdrTJVc"
  },
  {
    "title": "Kompilasi: Shimajiro | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "T8ocCOXJNJ8"
  },
  {
    "title": "Kompilasi: Ayah Shimajiro | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "yofhyX4I93g"
  },
  {
    "title": "Kompilasi: Musim Panas | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Fi2bQKuaKZA"
  },
  {
    "title": "Kompilasi: Pahlawan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "xIO4mgnWuAc"
  },
  {
    "title": "Judul: Shimajiro dan Teman-teman #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "U0U2zUVQfwo"
  },
  {
    "title": "Bunga Matahari Yang Berputar | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "9oPm4epblI4"
  },
  {
    "title": "Judul: Shimajiro dan Teman (2): Nikki #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "_Gnw5rETxnY"
  },
  {
    "title": "Harta Karun Hana Hilang?! | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "V--PXCbU3fo"
  },
  {
    "title": "Judul: Ingin Pergi Ke Restauran Keluarga #shimajiro #shimajiroindonesia #kartunanak #animasi",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "TauS8KTTHSs"
  },
  {
    "title": "Ayo Bantu Kak Niisuke! | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "U1slWePNRyQ"
  },
  {
    "title": "Judul: Shimajiro dan Teman (3): Mary-Lynne #shimajiro #shimajiroindonesia #animasi #kartunanak",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "MqvnklsRjXg"
  },
  {
    "title": "Aku Suka Donat! | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "RBVaLxRpbQM"
  },
  {
    "title": "Shimajiro dan Teman-teman | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "jRZm94H8h3s"
  },
  {
    "title": "Shimajiro dan Teman (3): Mary-Lynne | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "cJGlAreszCI"
  },
  {
    "title": "Shimajiro dan Teman (2): Nikki | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "O4lX0pcReiA"
  },
  {
    "title": "Shimajiro dan Teman (1): Tamasaburo | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "B3-iuWyJFbg"
  },
  {
    "title": "Ingin Pergi Ke Restoran Keluarga | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "kLylQtyB75s"
  },
  {
    "title": "Hana Jadi Orang Dewasa | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "4vAwxynw8QY"
  },
  {
    "title": "Deg-Degan Menjual Kue Crepe | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "haRLa1ne3I0"
  },
  {
    "title": "Kompilasi: Hari Ulang Tahunku | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "-Wwlj62B5Sg"
  },
  {
    "title": "Ayah Membuatku Malu | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "eWR-A7u9Ojc"
  },
  {
    "title": "Kompilasi: Bermain Bersama Teman | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "RKhlQDgeJMU"
  },
  {
    "title": "Judul: Di Mana Jamurnya? #shorts #shimajiro #shimajiroindonesia #laguanak #animasi",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "jCsxlbmyQ60"
  },
  {
    "title": "Di Mana Jamurnya? | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "wccTU7uRjIo"
  },
  {
    "title": "Kompilasi Lagu: Belajar Bersama | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "If2VuObsQlc"
  },
  {
    "title": "Kompilasi: Festival Seru | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "Hny29Hv1UT0"
  },
  {
    "title": "Kompilasi: Bermain di Rumah | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "2G8onJgXwGk"
  },
  {
    "title": "Kompilasi Lagu: Bermain Sepakbola | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "qg4OUnZJ-Ug"
  },
  {
    "title": "Kompilasi: Petualangan | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "VIu1OdcmWyw"
  },
  {
    "title": "Lagu Anak: Hemat Air | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "QgaU2NKMHcQ"
  },
  {
    "title": "Kompilasi: Anak Baik | Kartun Anak Bahasa Indonesia | Shimajiro Indonesia",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "6wha4NA050Y"
  },
  {
    "title": "Kompilasi: Musim Semi Yang Menyenangkan #shorts #shimajiro #shimajiroindonesia #laguanak #animasi",
    "category": "Kartun",
    "color": "#14b8a6",
    "id": "8nkSPMzK5qQ"
  },
  {
    "title": "Shaun the Sheep: The Beast of Mossy Bottom | Official Trailer 2",
    "category": "Kartun",
    "color": "#eab308",
    "id": "E47SqSqTozY"
  },
  {
    "title": "Adventures Under the Sun ☀️🐾",
    "category": "Kartun",
    "color": "#eab308",
    "id": "SchOU2JwGlI"
  },
  {
    "title": "Barnyard Dance Time 💃🐓",
    "category": "Kartun",
    "color": "#eab308",
    "id": "60GzOGpzZhc"
  },
  {
    "title": "Farmyard Surprise Party 🎉🐾",
    "category": "Kartun",
    "color": "#eab308",
    "id": "aW8ccBItCoc"
  },
  {
    "title": "Shaun The Sheep: The Beast of Mossy Bottom | Official Trailer",
    "category": "Kartun",
    "color": "#eab308",
    "id": "zjIl6pFT54M"
  },
  {
    "title": "🐑🌟 Shaun the Sheep’s Best Farm Adventures! – Cartoons for Kids | Full Episodes Compilation [1 Hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "0_s3OS7tCa4"
  },
  {
    "title": "🐑🎬 Shaun the Sheep Mega Episode Mix! – Cartoons for Children | Full HD Compilation [60 Minutes]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "2V-doYD19IU"
  },
  {
    "title": "🎉🐑 The Best of Shaun the Sheep! – Cartoons for Kids | Farm Adventures Full Compilation [1 Hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "BhB0XxHjiaQ"
  },
  {
    "title": "🎉🐑 Fun for Everyone on the Farm! 🐑 Shaun the Sheep 🐑 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "tJ_vfhXYPkc"
  },
  {
    "title": "Christmas Dinner 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "UFn44RrchAQ"
  },
  {
    "title": "Dynamic Duo 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "Xg9cdx6LquQ"
  },
  {
    "title": "Hay House 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "Z2p9NrNDnRY"
  },
  {
    "title": "Best Shaun Episodes🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "nTPIUps_3hA"
  },
  {
    "title": "Big Sheep Adventure! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "qdBA_iHQ2t4"
  },
  {
    "title": "Best Sheep Episodes 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "ykeO6La9ShQ"
  },
  {
    "title": "NEW🐑The Knit Before Christmas🐑Help Shaun the Sheep support Save the Children’s Christmas Jumper Day!",
    "category": "Kartun",
    "color": "#eab308",
    "id": "Rbnw6Fu6nHU"
  },
  {
    "title": "Shaun The Sheep: The Beast of Mossy Bottom | Movie Teaser | Coming Halloween 2026",
    "category": "Kartun",
    "color": "#eab308",
    "id": "wV4kROxS-WQ"
  },
  {
    "title": "Stuck up a tree!🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "F-iI1mxZFtc"
  },
  {
    "title": "Sheep Mischief🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "EGk_mfkfIYw"
  },
  {
    "title": "Winter Pizza🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "CfGQ1Xjac70"
  },
  {
    "title": "Everything has its place🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "CUdFx2_Rbi4"
  },
  {
    "title": "Autumn Harvest🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "7-FY9PBVDHU"
  },
  {
    "title": "Think of the Children🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "65Mkbis6ovA"
  },
  {
    "title": "Farm Fun🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "0H5cYEmvw5g"
  },
  {
    "title": "Whole Gang's here! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "QvNGzuR6Z7w"
  },
  {
    "title": "Jam mess! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "fd0BZGR9MSw"
  },
  {
    "title": "Sneaky Sheep🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "s9HTaQDg_6s"
  },
  {
    "title": "What's Wrong Timmy! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "sdyWtCY85sg"
  },
  {
    "title": "Summer on the Farm🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "stB-Tq96mO0"
  },
  {
    "title": "Mama Sheep🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "wHRWDlfYnLs"
  },
  {
    "title": "A Feast 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "7zhYP1diH5I"
  },
  {
    "title": "Pigs in trouble Again! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "8ZDu9FI41Zs"
  },
  {
    "title": "Bounce! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "CO1Fbr1coQQ"
  },
  {
    "title": "Party Timmy🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Season 4 All Episodes in Full [3 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "CMFUapDutkM"
  },
  {
    "title": "Sheep Spy 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "L-vre-XcDD4"
  },
  {
    "title": "Be Prepared for FUN🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Season 3 All Episodes in Full [2 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "XT9ErHTMop8"
  },
  {
    "title": "Farm Food Fun 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "eo-9VJNxxTA"
  },
  {
    "title": "Sheep are real? 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "hZ6WDPX8BF8"
  },
  {
    "title": "Sad Sheep🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Season 1 All Episodes in Full [4 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "7zpBOy_yVNE"
  },
  {
    "title": "Crazy Sheep! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "j5cGHkbXNs4"
  },
  {
    "title": "Chef Shaun 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "lKZ_yqNnQK0"
  },
  {
    "title": "Drum Roll Please!🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Season 5 All Episodes in Full [2 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "sxcU_NUJgy4"
  },
  {
    "title": "Play Fighting! 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "m6lluhgPZpw"
  },
  {
    "title": "Best Dog 🐑 Shaun the Sheep 🐑 - Cartoons for Kids 🐑 Season 2 All Episodes in Full [4 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "tVC0O38o1hQ"
  },
  {
    "title": "Shaun dresses up | Kids Cartoons & Fun🐑 Shaun the Sheep 🐑 Full Episodes",
    "category": "Kartun",
    "color": "#eab308",
    "id": "DJi8FJz8_PY"
  },
  {
    "title": "Painted Sheep | Kids Cartoons & Fun in 4K🐑 Shaun the Sheep 🐑 Full Episodes 🐑 Fun For Hours",
    "category": "Kartun",
    "color": "#eab308",
    "id": "_79xsgm4ww0"
  },
  {
    "title": "🐑 Shaun the Sheep 🐑 Shaun the builder! | Kids Cartoons & Fun in 4K 🐑 Full Episodes",
    "category": "Kartun",
    "color": "#eab308",
    "id": "lpFOpUZYp5Q"
  },
  {
    "title": "🐑 Shaun the Sheep 🐑 Tiimy the builder! | Kids Cartoons & Fun in 4K 🐑 Full Episodes",
    "category": "Kartun",
    "color": "#eab308",
    "id": "XlMlFGcKJhs"
  },
  {
    "title": "Shaun the Sheep 🐑 Sheep at work! - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "0K2iyAItIxs"
  },
  {
    "title": "Shaun the Sheep 🐑 Fox goes shopping - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "7iv28bhVDlU"
  },
  {
    "title": "Shaun the Sheep 🐑 Night time notes - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "Ar6cp0Q3ceM"
  },
  {
    "title": "Shaun the Sheep 🐑 The Hungry Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "IRY-IHXM7u8"
  },
  {
    "title": "Shaun the Sheep 🐑 The time for sheep is NOW - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "J903cY2Z76I"
  },
  {
    "title": "Shaun the Sheep 🐑 Coffee with Shaun - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "Mip3nQkHr1k"
  },
  {
    "title": "Shaun the Sheep 🐑 The monster on the farm! - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "RcsLtfNrbck"
  },
  {
    "title": "Shaun the Sheep 🐑 The Great Sheep Escape - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "kefpINB2cec"
  },
  {
    "title": "Shaun the Sheep 🐑 Boss Sheep! - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "tlhIA4SkwvM"
  },
  {
    "title": "Shaun the Sheep 🐑 Magic Hat - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "uuwKdD3fL8A"
  },
  {
    "title": "Shaun the Sheep 🐑 A Wool Adventure - Cartoons for Kids 🐑 Full Episodes Compilation",
    "category": "Kartun",
    "color": "#eab308",
    "id": "4M7hJz6UNzA"
  },
  {
    "title": "🐑 Shaun The Sheep Christmas 🐑 We Wish Ewe A Merry Christmas🐑 Brand New Episodes, Cartoons for kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "dCoA6bJ48P0"
  },
  {
    "title": "Shaun the Sheep 🐑 BIG PIG! - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "ugXxP7bBsnU"
  },
  {
    "title": "Wallace & Gromit: Vengeance Most Fowl | OFFICIAL NETFLIX TRAILER 🐧 #WallaceandGromit #Aardman",
    "category": "Kartun",
    "color": "#eab308",
    "id": "nlgpOsl4djI"
  },
  {
    "title": "Shaun the Sheep Special 🐑Season 1 Holiday Watch Party! - Cartoons for Kids 🐑 Full Episodes [4 hours]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "7DnopaJW03c"
  },
  {
    "title": "NEW🐑The Knit Before Christmas🐑Help Shaun the Sheep support Save the Children’s Christmas Jumper Day!",
    "category": "Kartun",
    "color": "#eab308",
    "id": "5cM6rsbjSq0"
  },
  {
    "title": "Shaun the Sheep 🐑 Night night sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "owadDWUijyA"
  },
  {
    "title": "Shaun the Sheep 🐑 Just enough money! - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "PzFuWI5LAis"
  },
  {
    "title": "Shaun the Sheep 🐑 It's Magic….sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "PG83E6qwAyk"
  },
  {
    "title": "Behind the Scenes on Shaun the Sheep x Barbour 2024! 🎄🎁",
    "category": "Kartun",
    "color": "#eab308",
    "id": "CijYmpXPxM4"
  },
  {
    "title": "Shaun the Sheep 🐑 Farm Tech gone wrong - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "M8ppDTbaWfA"
  },
  {
    "title": "🎁 Shaun the Sheep x Barbour 🎄 Christmas Advert 2024",
    "category": "Kartun",
    "color": "#eab308",
    "id": "RVyIHn6M194"
  },
  {
    "title": "Shaun the Sheep 🐑 Computer Genius Shaun - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "wD8izUg2E14"
  },
  {
    "title": "Shaun the Sheep 🐑 Farmer Time - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "xp4CYtZx2Xg"
  },
  {
    "title": "Shaun the Sheep 🐑 Sheep with a Plan - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "fbPwfB0wDmY"
  },
  {
    "title": "Shaun the Sheep 🐑 Diggy Diggy Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "DzXQiOxWFyo"
  },
  {
    "title": "Sleepy Time 🐑 Shaun the Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "15C1s6tgLsw"
  },
  {
    "title": "NEW 🐑 Dance and Freeze (round 2) 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "vXs94huRhKk"
  },
  {
    "title": "Wallace & Gromit: Vengeance Most Fowl | OFFICIAL TEASER TRAILER 🐧 #WallaceandGromit",
    "category": "Kartun",
    "color": "#eab308",
    "id": "NIjM-EgVDQ8"
  },
  {
    "title": "NEW 🐑 Shaun in Space 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "oJbIsf7RkrA"
  },
  {
    "title": "NEW 🐑 Spot the Difference 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "ymQcJXsZ-5c"
  },
  {
    "title": "NEW 🐑 Help Gran 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "HbtXIajtpJU"
  },
  {
    "title": "NEW 🐑 Get Gran Home 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "mD3Z3yfbq8Y"
  },
  {
    "title": "NEW 🐑 Lost in Space 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "RTgwWUJNxFQ"
  },
  {
    "title": "NEW 🐑 Feed Shirley 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "FT6l8d5q1MI"
  },
  {
    "title": "NEW 🐑 Dance and Freeze 🐑 Shaun the Sheep - Brain Break 🐑 For Kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "tEbemmEATm0"
  },
  {
    "title": "Sheep on Phone!🐑 Shaun the Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "3B6YcMb3iGY"
  },
  {
    "title": "🐑 Shaun The Sheep YouTube Special 🐑 Timmy and the Dragon🐑 Brand New Episodes, Cartoons for kids",
    "category": "Kartun",
    "color": "#eab308",
    "id": "0xIM-eCzf-g"
  },
  {
    "title": "Maintenance Sheep🐑 Shaun the Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "AgCWBAVWnGM"
  },
  {
    "title": "Can Sheep Fly? 🐑 Shaun the Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "HW_jOVBF5h0"
  },
  {
    "title": "NEW Wallace & Gromit character! 😯 Introducing Norbot 🛠️ #WallaceandGromit",
    "category": "Kartun",
    "color": "#eab308",
    "id": "lviUa3YomJM"
  },
  {
    "title": "Bull Rampage! 🐑 Shaun the Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "PpNrSnle2SA"
  },
  {
    "title": "The Mission 🐑 Shaun the Sheep - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "TfZPmsAEGLo"
  },
  {
    "title": "Shaun the Sheep 🐑 Farm Antics - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "ZW9TIRV1cs0"
  },
  {
    "title": "Shaun the Sheep - LIVE 🚨 BRAND NEW EPISODES 🐑 Cartoons for kids, Preschool, Farm",
    "category": "Kartun",
    "color": "#eab308",
    "id": "_ELkQQmFT-0"
  },
  {
    "title": "Shaun the Sheep 🐑 3 sheep in a coat! - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "er68sf4s8HY"
  },
  {
    "title": "Shaun the Sheep 🐑 What's in the case..APPLE - Cartoons for Kids 🐑 Full Episodes Compilation [1 hour]",
    "category": "Kartun",
    "color": "#eab308",
    "id": "fh7mGMVYtSM"
  }
];

async function main() {
  console.log("Seeding channel videos ...");
  let added = 0, skipped = 0;
  for (const v of videos) {
    const url = `https://www.youtube.com/watch?v=${v.id}`;
    const existing = await prisma.video.findFirst({ where: { url } });
    if (existing) { skipped++; continue; }
    await prisma.video.create({ data: { title: v.title, duration: "", category: v.category, color: v.color, url } });
    added++;
  }
  console.log(`Done. Added ${added}, skipped ${skipped}.`);
}
main().then(async () => { await prisma.$disconnect(); }).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

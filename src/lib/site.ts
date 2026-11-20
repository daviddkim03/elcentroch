import { withBasePath } from "@/lib/base-path";

export const site = {
  nameKo: "엘센트로 한인교회",
  nameEn: "El Centro Korean Church",
  address: "1274 W El Dorado Ave, El Centro, CA 92243",
  phone: "760-352-3889",
  pastorKo: "김요셉 목사",
  pastorEn: "Rev. Joseph Kim",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=1274+W+El+Dorado+Ave+El+Centro+CA+92243",
  mapEmbed:
    "https://www.google.com/maps?q=1274+W+El+Dorado+Ave,+El+Centro,+CA+92243&output=embed",
};

export const nav = [
  { to: "/about", ko: "교회소개", en: "About" },
  { to: "/worship", ko: "예배와 말씀", en: "Worship & Word" },
  { to: "/ministry", ko: "사역", en: "Ministries" },
  { to: "/next-generation", ko: "다음세대", en: "Next Generation" },
  { to: "/community", ko: "커뮤니티", en: "Community" },
];

export const images = {
  hero1: withBasePath("/images/hero-1.jpg"),
  hero2: withBasePath("/images/hero-2.jpg"),
  hero3: withBasePath("/images/hero-3.jpg"),
};

export type HeroSlide = {
  id: string;
  image_url: string;
  title_ko: string | null;
  title_en: string | null;
  subtitle_ko: string | null;
  subtitle_en: string | null;
  sort_order?: number;
};

export const defaultSlides: HeroSlide[] = [
  {
    id: "d1",
    image_url: images.hero1,
    title_ko: "하나님의 사랑이 머무는 교회",
    title_en: "A Church Where God's Love Dwells",
    subtitle_ko: "엘센트로 한인교회에 오신 것을 환영합니다",
    subtitle_en: "Welcome to El Centro Korean Church",
  },
  {
    id: "d2",
    image_url: images.hero2,
    title_ko: "예배로 하나 되는 공동체",
    title_en: "One Community in Worship",
    subtitle_ko: "주일예배 · 매주 일요일 오전 9시",
    subtitle_en: "Sunday Service · Every Sunday 9:00 AM",
  },
  {
    id: "d3",
    image_url: images.hero3,
    title_ko: "말씀 위에 세워지는 삶",
    title_en: "Lives Built on the Word",
    subtitle_ko: "함께 말씀을 나누고 기도합니다",
    subtitle_en: "We share the Word and pray together",
  },
];

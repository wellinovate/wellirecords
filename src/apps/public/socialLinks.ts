import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

// Official WelliRecord social accounts. Change them here only.
export const SOCIAL_LINKS = [
  { name: "Facebook", handleName: "WelliRecord", href: "https://www.facebook.com/profile.php?id=61596458829642", icon: FaFacebook, className: "text-[#1877F2]" },
  { name: "Instagram", handleName: "mywellirecord", href: "https://www.instagram.com/mywellirecord", icon: FaInstagram, className: "text-pink-500" },
  { name: "TikTok", handleName: "wellirecord", href: "https://www.tiktok.com/@wellirecord", icon: FaTiktok, className: "text-black" },
  { name: "LinkedIn", handleName: "wellirecord", href: "https://www.linkedin.com/company/wellirecord/", icon: FaLinkedin, className: "text-[#0A66C2]" },
  { name: "X", handleName: "wellinovate", href: "https://x.com/wellinovate", icon: FaXTwitter, className: "text-black" },
  { name: "YouTube", handleName: "wellirecord", href: "https://youtube.com/@wellirecord", icon: FaYoutube, className: "text-red-600" },
] as const;

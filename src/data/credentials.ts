type AchievedCredential = Readonly<{
  id: string;
  alias: string;
  title: string;
  badge: string;
  certificate: string;
  certificateVector: string;
  date: string;
  cardDate: string;
  issued: string;
  credential: string;
  description: string;
  htbUrl: string | null;
  credlyUrl: string;
}>;

export const achievedCredentials: readonly AchievedCredential[] = [
  {
    id: "cpts",
    alias: "HTB CPTS",
    title: "Certified Penetration Testing Specialist",
    badge: "/certifications/htb-cpts-badge.png",
    certificate: "/certifications/htb-cpts-certificate.jpg",
    certificateVector: "/certifications/htb-cpts-certificate.svg",
    date: "2026-09-04",
    cardDate: "04 SEP 2026",
    issued: "Sept. 4, 2026",
    credential: "356ED9AD71",
    description: "A hands-on assessment of end-to-end penetration testing: reconnaissance, exploitation, Active Directory, lateral movement, privilege escalation, pivoting, and professional reporting.",
    htbUrl: "https://profile.hackthebox.com/profile/019e367d-68ab-7287-bd06-ec8449a07adb/certificate/HTBCERT-356ED9AD71?utm_medium=copy_url",
    credlyUrl: "https://www.credly.com/badges/1bacf91c-938a-4d0c-84ad-382d27bd2365/public_url",
  },
  {
    id: "cwes",
    alias: "HTB CWES",
    title: "Certified Web Exploitation Specialist",
    badge: "/certifications/htb-cwes-badge.png",
    certificate: "/certifications/htb-cwes-certificate.jpg",
    certificateVector: "/certifications/htb-cwes-certificate.svg",
    date: "2026-10-12",
    cardDate: "12 OCT 2026",
    issued: "Oct. 12, 2026",
    credential: "2163ABCE16",
    description: "A hands-on assessment of web application penetration testing: identifying and exploiting vulnerabilities, chaining weaknesses into meaningful impact, and documenting findings in a professional report.",
    htbUrl: "https://profile.hackthebox.com/profile/019e367d-68ab-7287-bd06-ec8449a07adb/certificate/HTBCERT-2163ABCE16?utm_medium=copy_url",
    credlyUrl: "https://www.credly.com/badges/ccd1f9d0-70e0-403d-9b88-d55894d53cfe/public_url",
  },
];

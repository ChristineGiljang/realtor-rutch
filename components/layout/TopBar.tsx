import { Mail, Phone } from "lucide-react";

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function TopBar() {
  return (
    <div className="w-full bg-[#3D2119] text-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs sm:text-sm">
        <a
          href="mailto:rldreamspaces@gmail.com"
          className="flex items-center gap-2 hover:text-[#C9A96E] transition truncate"
        >
          <Mail size={14} className="shrink-0" />
          <span className="truncate">rldreamspaces@gmail.com</span>
        </a>

        <div className="flex items-center gap-4 shrink-0">
          <a
            href="https://www.facebook.com/rutchilynllagoso2026"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-[#C9A96E] hover:text-[#faf9f6] transition"
          >
            <FacebookIcon size={14} />
          </a>
          <a
            href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Frutch_rldreamspaces%3Ffbclid%3DIwcGRvZgVleHRuA2FlbQIxMABicmlkETF1clNxYWllMlYyUHpiUWJhc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHlaTehWSFtSjaJ8oc1TQ3eiJ_WVYYDfY9yPAioiYcj96OXe52P3Iabceep2m_aem_3dTDO9QNlonG4GWffg3nPw&h=AUDwQuZnURLIy-N4fMa9oG3Kz-27QiRPnUA2AkcDXhIZecs1P7Kcmuk1keCIzLWjmZHTErENTYoNoy8UqrBwe0mP7QwM0_WpgIBk8yFKmHxQcn4GL_2qwWFuKQMCquiuSr1U"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-[#C9A96E] hover:text-[#faf9f6] transition"
          >
            <InstagramIcon size={14} />
          </a>
          <span className="hidden sm:inline text-[#faf9f6]/30">|</span>
          <a
            href="tel:+639817413929"
            className="flex items-center gap-2 hover:text-[#C9A96E] transition"
          >
            <Phone size={14} className="shrink-0" />
            <span>+63 981 741 3929</span>
          </a>
        </div>
      </div>
    </div>
  );
}

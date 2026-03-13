import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";

export default function WelliFooter() {
  return (
    <footer className="w-full bg-[#D9D9D9]">
      <div className="relative min-h-[637px] w-full overflow-hidden">
        <div className=" bg-[#002A66] flex justify-center">
          <div className=" mx-auto rounded-[8px] bg-transparent px-[70px] pt-[68px] pb-[56px]">
            {/* logo */}
            <div className="mb-[86px]">
              <img
                src="/logos.png"
                alt="WelliRecord"
                className="h-[36px] w-auto object-contain"
              />
            </div>

            {/* columns */}
            <div className="grid grid-cols-[320px_220px_1fr] gap-x-[95px]">
              {/* contact */}
              <div className="text-[#ffffff]">
                <p className="text-[20px] leading-[1.35] tracking-[-0.02em]">
                  Reach out to us @
                </p>

                <div className="mt-[18px] flex items-center gap-[12px]">
                  <span className="text-[28px] leading-none">🇳🇬</span>
                  <span className="text-[20px] leading-[1.35] tracking-[-0.02em]">
                    Lagos, Nigeria.
                  </span>
                </div>

                <p className="mt-[18px] text-[20px] leading-[1.35] tracking-[-0.02em]">
                  070 000 0000
                </p>
              </div>

              {/* middle links */}
              <nav className="flex flex-col gap-[18px] text-[#ffffff]">
                {["About Us", "Solutions", "Pricing", "Partners"].map(
                  (item) => (
                    <a
                      key={item}
                      href="#"
                      className="text-[20px] leading-[1.35] tracking-[-0.02em]"
                    >
                      {item}
                    </a>
                  ),
                )}
              </nav>

              {/* right links */}
              <nav className="flex flex-col gap-[18px] text-[#ffffff]">
                {[
                  "Create Health Vault",
                  "Register Your Organisation",
                  "For Healthcare Providers",
                  "Log In",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-[20px] leading-[1.35] tracking-[-0.02em]"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* social */}
            <div className="mt-[128px] flex items-center justify-center gap-[48px] text-white">
              <a href="#" aria-label="Instagram">
                <Instagram size={28} strokeWidth={2} />
              </a>

              <a href="#" aria-label="Twitter">
                <Twitter size={28} strokeWidth={2} />
              </a>

              <a href="#" aria-label="Facebook">
                <Facebook size={28} strokeWidth={2} />
              </a>

              <a href="#" aria-label="LinkedIn">
                <Linkedin size={28} strokeWidth={2} />
              </a>
            </div>

            {/* copyright */}
            <p className="mt-[82px] text-center text-[22px] leading-[1.35] tracking-[-0.02em] text-[#ffffff]">
              © 2026 WelliRecord Ltd. Lagos, Nigeria.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

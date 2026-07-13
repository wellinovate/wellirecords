import { welliIcon } from "@/assets";
import { Link } from "react-router-dom";

export default function WelliFooter() {
  return (
    <footer className="welli-footer">
      <style>{`
        .welli-footer {
          background: #050F26;
          padding: 72px 24px 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #FFFFFF;
          -webkit-font-smoothing: antialiased;
        }
        .foot-inner {
          max-width: 1160px;
          margin: 0 auto;
        }
        .brand {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 56px;
          align-items: flex-start;
        }
        .logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wordmark {
          font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.01em;
          display: inline-flex;
          align-items: flex-start;
          gap: 2px;
          color: #FFFFFF;
        }
        .wordmark .rec {
          font-weight: 400;
          color: #9FB2D6;
        }
        .wordmark sup {
          font-size: 10px;
          font-weight: 400;
          color: #7387AE;
          margin-top: 2px;
        }
        .tagline {
          font-size: 11.5px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #7387AE;
          font-weight: 600;
        }
        .cols {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 64px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .col h3 {
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7387AE;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 0;
          margin: 0;
        }
        .col a {
          color: #D7E1F4;
          text-decoration: none;
          font-size: 15.5px;
          display: inline-flex;
          align-items: center;
          gap: 11px;
          transition: color .15s ease;
        }
        .col a:hover {
          color: #FFFFFF;
        }
        .col a:focus-visible {
          outline: 2px solid #FFFFFF;
          outline-offset: 3px;
          border-radius: 2px;
        }
        .col .static {
          color: #D7E1F4;
          font-size: 15.5px;
          display: inline-flex;
          align-items: center;
          gap: 11px;
        }
        .col svg.ic {
          flex: none;
          opacity: 0.65;
        }
        .wa-inline {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #25D366;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .bottom {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 26px 0 34px;
        }
        .bottom p {
          font-size: 13.5px;
          color: #7387AE;
          margin: 0;
        }
        .legal {
          display: flex;
          gap: 24px;
        }
        .legal a {
          font-size: 13.5px;
          color: #9FB2D6;
          text-decoration: none;
        }
        .legal a:hover {
          color: #FFFFFF;
          text-decoration: underline;
        }
        @media (max-width:760px) {
          .cols {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
      <div className="foot-inner">

        <div className="brand">
          <Link to="/" className="logo-row">
            <img src={welliIcon} alt="WelliRecord logo" className="h-9 w-9 object-contain" />
            <span className="wordmark">Welli<span className="rec">Record</span><sup>™</sup></span>
          </Link>
          <span className="tagline">One patient. One trusted record. Accessible when it matters.</span>
        </div>

        <div className="cols">
          <div className="col">
            <h3>Contact us</h3>
            <ul>
              <li>
                <span className="static">
                  <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D7E1F4" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 21s-7-5.2-7-11a7 7 0 1114 0c0 5.8-7 11-7 11z"/>
                    <circle cx="12" cy="10" r="2.6"/>
                  </svg>
                  Abuja, Nigeria 🇳🇬
                </span>
              </li>
              <li>
                <a href="tel:+2348053355504">
                  <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D7E1F4" strokeWidth="1.8" aria-hidden="true">
                    <path d="M5 4h4l1.5 4.5L8 10a12 12 0 006 6l1.5-2.5L20 15v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/>
                  </svg>
                  +234 805 335 5504
                </a>
              </li>
              <li>
                <a href="https://wa.me/2348053355504" target="_blank" rel="noopener noreferrer">
                  <span className="wa-inline" aria-hidden="true">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </span>
                  WhatsApp support
                </a>
              </li>
              <li>
                <a href="mailto:inquiry@wellirecord.com">
                  <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D7E1F4" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 7l9 6 9-6"/>
                  </svg>
                  inquiry@wellirecord.com
                </a>
              </li>
            </ul>
          </div>

          <div className="col">
            <h3>Company</h3>
            <ul>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/#solutions">Solutions</Link></li>
              <li><Link to="/#proof">Pricing</Link></li>
              <li><Link to="/partners">Partners</Link></li>
            </ul>
          </div>

          <div className="col">
            <h3>Get started</h3>
            <ul>
              <li><Link to="/auth/patient/signup">Create health vault</Link></li>
              <li><Link to="/auth/provider/signup">Register your organisation</Link></li>
              <li><Link to="/auth/login">Log in</Link></li>
            </ul>
          </div>
        </div>

        <div className="bottom">
          <p>© {new Date().getFullYear()} WelliRecord Ltd. Abuja, Nigeria. All rights reserved.</p>
          <div className="legal">
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of service</Link>
            <Link to="/privacy">NDPA notice</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

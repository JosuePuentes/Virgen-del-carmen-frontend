export default function Header() {
  return (
    <header className="top-bar">
      <div className="container top-bar-inner">
        <div className="contact-info">
          <a href="tel:0247VIRGENCARMEN">0247-VIRGENCARMEN</a>
          <span className="sep">|</span>
          <a href="mailto:contacto@virgencarmen.com">contacto@virgencarmen.com</a>
        </div>
        <div className="top-right">
          <a href="https://wa.me/584142981980" className="social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="#" className="social-link" aria-label="Facebook">Facebook</a>
          <a href="#" className="social-link" aria-label="Instagram">Instagram</a>
          <a href="#" className="btn-intranet">INTRANET</a>
        </div>
      </div>
    </header>
  )
}

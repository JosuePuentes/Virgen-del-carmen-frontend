const brands = ['Pfizer', 'Cinfa', 'Bayer', 'Sanofi', 'Drocolven', 'Genfar']

export default function Brands() {
  return (
    <section className="brands-section">
      <div className="container">
        <h2 className="section-title">Marcas que confían en nosotros</h2>
        <div className="brands-row">
          {brands.map((name) => (
            <span key={name} className="brand-name">{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

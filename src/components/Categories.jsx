const categories = [
  { icon: '💊', label: 'Medicamentos éticos' },
  { icon: '🩹', label: 'Medicamentos de venta libre' },
  { icon: '✂️', label: 'Material médico-quirúrgico' },
  { icon: '🧴', label: 'Cuidado personal' },
  { icon: '🦷', label: 'Higiene y aseo' },
]

export default function Categories() {
  return (
    <section className="categories" id="catalogo">
      <div className="container">
        <h2 className="section-title">Explora nuestras categorías</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <a key={cat.label} href="#" className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

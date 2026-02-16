const items = [
  'Laboratorios nacionales e internacionales',
  'Insumos médicos y quirúrgicos',
  'Productos de cuidado personal',
  'Material de curación y diagnóstico',
]

export default function Distribuye() {
  return (
    <section className="distribuye-section">
      <div className="container">
        <h2 className="section-title light">¿Qué marcas distribuimos?</h2>
        <p className="distribuye-intro">
          Trabajamos con los principales laboratorios y fabricantes del sector para ofrecerte un catálogo amplio y confiable.
        </p>
        <div className="distribuye-grid">
          {items.map((text) => (
            <div key={text} className="distribuye-item">{text}</div>
          ))}
        </div>
      </div>
    </section>
  )
}

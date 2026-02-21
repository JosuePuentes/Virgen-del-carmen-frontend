import { useState, useMemo } from 'react'
import { apiGet, getAdminToken } from '../../config/api'
import { useBcv } from '../../context/BcvContext'
import { formatPrecio } from '../../context/BcvContext'
import * as XLSX from 'xlsx'

const TIPOS_INFORME = [
  { id: 'ventas', label: 'General de ventas (facturado)', endpoint: 'facturas/pagadas', endpointAlt: 'facturas/' },
  { id: 'inventario', label: 'Inventario', endpoint: 'inventario_maestro/' },
  { id: 'cuentas_cobrar', label: 'Cuentas por cobrar', endpoint: 'cuentas-por-cobrar/vigentes', endpointAlt: 'cuentas-por-cobrar/vencidas' },
  { id: 'cuentas_pagar', label: 'Cuentas por pagar', endpoint: 'cuentas-por-pagar/' },
  { id: 'clientes', label: 'General de clientes', endpoint: 'clientes/all', endpointAlt: 'clientes/' },
  { id: 'gastos', label: 'Gastos', endpoint: 'gastos/' },
  { id: 'proveedores', label: 'Proveedores', endpoint: 'proveedores/' },
  { id: 'compras', label: 'Compras', endpoint: 'ordenes-compra/' },
  { id: 'picking', label: 'Picking', endpoint: 'pedidos/por_estado/picking', endpointAlt: 'pedidos/picking/' },
  { id: 'packing', label: 'Packing', endpoint: 'pedidos/por_estado/packing' },
  { id: 'solicitudes', label: 'Solicitudes', endpoint: 'clientes/solicitudes/pendientes' },
  { id: 'finanzas', label: 'Finanzas', endpoint: 'finanzas/resumen', endpointAlt: 'finanzas/gastos' },
]

const FILTROS_POR_INFORME = {
  ventas: [
    { key: 'numero_factura', label: 'Número factura', default: true },
    { key: 'cliente', label: 'Cliente', default: true },
    { key: 'fecha', label: 'Fecha', default: true },
    { key: 'monto', label: 'Monto', default: true },
    { key: 'desde', label: 'Fecha desde', type: 'date' },
    { key: 'hasta', label: 'Fecha hasta', type: 'date' },
  ],
  inventario: [
    { key: 'codigo', label: 'Código', default: true },
    { key: 'descripcion', label: 'Descripción', default: true },
    { key: 'costo', label: 'Costo', default: false },
    { key: 'utilidad', label: 'Utilidad', default: false },
    { key: 'precio', label: 'Precio', default: true },
    { key: 'existencia', label: 'Existencia', default: true },
    { key: 'solo_con_existencia', label: 'Solo con existencia > 0', default: false, type: 'checkbox' },
    { key: 'solo_costo_existencia', label: 'Solo costo y existencia', default: false, type: 'checkbox' },
  ],
  cuentas_cobrar: [
    { key: 'factura', label: 'Factura', default: true },
    { key: 'cliente', label: 'Cliente', default: true },
    { key: 'monto', label: 'Monto', default: true },
    { key: 'fecha_vencimiento', label: 'Fecha vencimiento', default: true },
    { key: 'incluir_vencidas', label: 'Incluir vencidas', default: true, type: 'checkbox' },
  ],
  cuentas_pagar: [
    { key: 'proveedor', label: 'Proveedor', default: true },
    { key: 'concepto', label: 'Concepto', default: true },
    { key: 'monto', label: 'Monto', default: true },
    { key: 'fecha_vencimiento', label: 'Fecha vencimiento', default: true },
  ],
  clientes: [
    { key: 'rif', label: 'RIF', default: true },
    { key: 'empresa', label: 'Empresa', default: true },
    { key: 'encargado', label: 'Encargado', default: true },
    { key: 'email', label: 'Correo', default: true },
    { key: 'telefono', label: 'Teléfono', default: true },
    { key: 'limite_credito', label: 'Límite crédito', default: true },
  ],
  gastos: [
    { key: 'fecha', label: 'Fecha', default: true },
    { key: 'descripcion', label: 'Descripción', default: true },
    { key: 'categoria', label: 'Categoría', default: true },
    { key: 'monto', label: 'Monto', default: true },
    { key: 'desde', label: 'Desde', type: 'date' },
    { key: 'hasta', label: 'Hasta', type: 'date' },
  ],
  proveedores: [
    { key: 'rif', label: 'RIF', default: true },
    { key: 'empresa', label: 'Empresa', default: true },
    { key: 'contacto', label: 'Contacto', default: true },
    { key: 'telefono', label: 'Teléfono', default: true },
  ],
  compras: [
    { key: 'id', label: 'ID orden', default: true },
    { key: 'proveedor', label: 'Proveedor', default: true },
    { key: 'total', label: 'Total', default: true },
    { key: 'fecha', label: 'Fecha', default: true },
    { key: 'estado', label: 'Estado', default: true },
  ],
  picking: [
    { key: 'id', label: 'ID pedido', default: true },
    { key: 'cliente', label: 'Cliente', default: true },
    { key: 'total', label: 'Total', default: true },
    { key: 'estado', label: 'Estado', default: true },
  ],
  packing: [
    { key: 'id', label: 'ID pedido', default: true },
    { key: 'cliente', label: 'Cliente', default: true },
    { key: 'total', label: 'Total', default: true },
    { key: 'estado', label: 'Estado', default: true },
  ],
  solicitudes: [
    { key: 'rif', label: 'RIF', default: true },
    { key: 'empresa', label: 'Empresa', default: true },
    { key: 'encargado', label: 'Encargado', default: true },
    { key: 'fecha_solicitud', label: 'Fecha solicitud', default: true },
  ],
  finanzas: [
    { key: 'valor_vendido', label: 'Valor vendido', default: true },
    { key: 'utilidad', label: 'Utilidad', default: true },
    { key: 'cuentas_cobrar', label: 'Cuentas por cobrar', default: true },
    { key: 'cuentas_pagar', label: 'Cuentas por pagar', default: true },
    { key: 'gastos', label: 'Gastos', default: true },
  ],
}

function getFiltrosIniciales(tipoId) {
  const items = FILTROS_POR_INFORME[tipoId] || []
  const obj = {}
  items.forEach((f) => {
    if (f.type === 'checkbox') obj[f.key] = f.default ?? false
    else if (f.type === 'date') obj[f.key] = ''
    else obj[f.key] = f.default ?? true
  })
  return obj
}

export default function AdminInformes() {
  const { bcv } = useBcv()
  const [busqueda, setBusqueda] = useState('')
  const [informeSeleccionado, setInformeSeleccionado] = useState(null)
  const [modalFiltros, setModalFiltros] = useState(false)
  const [filtros, setFiltros] = useState({})
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewVisible, setPreviewVisible] = useState(false)

  const tiposFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return TIPOS_INFORME
    return TIPOS_INFORME.filter((t) => t.label.toLowerCase().includes(q))
  }, [busqueda])

  function abrirModal(tipo) {
    setInformeSeleccionado(tipo)
    setFiltros(getFiltrosIniciales(tipo.id))
    setModalFiltros(true)
    setDatos(null)
    setPreviewVisible(false)
  }

  function handleFiltroChange(key, value) {
    setFiltros((f) => ({ ...f, [key]: value }))
  }

  async function generarInforme() {
    if (!informeSeleccionado) return
    setLoading(true)
    setError('')
    setDatos(null)
    try {
      const token = getAdminToken()
      let lista = []
      const tipo = informeSeleccionado.id

      if (tipo === 'ventas') {
        const res = await apiGet('facturas/pagadas', token).catch(() => apiGet('facturas/', token))
        lista = Array.isArray(res) ? res : res?.facturas || res?.items || []
        if (filtros.desde || filtros.hasta) {
          lista = lista.filter((f) => {
            const fecha = (f.fecha_pago || f.fecha || f.fecha_emision || '').slice(0, 10)
            if (filtros.desde && fecha < filtros.desde) return false
            if (filtros.hasta && fecha > filtros.hasta) return false
            return true
          })
        }
      } else if (tipo === 'inventario') {
        const res = await apiGet('inventario_maestro/', token)
        lista = Array.isArray(res) ? res : res?.items || res?.productos || []
        if (filtros.solo_con_existencia) lista = lista.filter((p) => (p.existencia || 0) > 0)
      } else if (tipo === 'cuentas_cobrar') {
        const vigentes = await apiGet('cuentas-por-cobrar/vigentes', token).catch(() => [])
        const vencidas = filtros.incluir_vencidas
          ? await apiGet('cuentas-por-cobrar/vencidas', token).catch(() => [])
          : []
        lista = [
          ...(Array.isArray(vigentes) ? vigentes : vigentes?.facturas || []),
          ...(Array.isArray(vencidas) ? vencidas : vencidas?.facturas || []),
        ]
      } else if (tipo === 'cuentas_pagar') {
        const res = await apiGet('cuentas-por-pagar/', token)
        lista = Array.isArray(res) ? res : res?.cuentas || res?.items || []
      } else if (tipo === 'clientes') {
        const res = await apiGet('clientes/all', token).catch(() => apiGet('clientes/', token))
        lista = Array.isArray(res) ? res : res?.clientes || res?.items || []
      } else if (tipo === 'gastos') {
        let path = 'gastos/'
        if (filtros.desde || filtros.hasta) path += `?desde=${filtros.desde || ''}&hasta=${filtros.hasta || ''}`
        const res = await apiGet(path, token)
        lista = Array.isArray(res) ? res : res?.gastos || res?.items || []
      } else if (tipo === 'proveedores') {
        const res = await apiGet('proveedores/', token)
        lista = Array.isArray(res) ? res : res?.proveedores || res?.items || []
      } else if (tipo === 'compras') {
        const res = await apiGet('ordenes-compra/', token)
        lista = Array.isArray(res) ? res : res?.ordenes || res?.items || []
      } else if (tipo === 'picking') {
        const res = await apiGet('pedidos/picking/', token).catch(() => apiGet('pedidos/por_estado/picking', token))
        lista = Array.isArray(res) ? res : res?.pedidos || res?.items || []
      } else if (tipo === 'packing') {
        const res = await apiGet('pedidos/por_estado/packing', token)
        lista = Array.isArray(res) ? res : res?.pedidos || res?.items || []
      } else if (tipo === 'solicitudes') {
        const res = await apiGet('clientes/solicitudes/pendientes', token)
        lista = Array.isArray(res) ? res : res?.solicitudes || res?.items || []
      } else if (tipo === 'finanzas') {
        const [resumen, gastos] = await Promise.all([
          apiGet('finanzas/resumen', token).catch(() => ({})),
          apiGet('finanzas/gastos', token).catch(() => ({ total: 0 })),
        ])
        const cobrar = await apiGet('cuentas-por-cobrar/total', token).catch(() => ({ total: 0 }))
        const pagar = await apiGet('cuentas-por-pagar/total', token).catch(() => ({ total: 0 }))
        lista = [{
          valor_vendido: resumen?.valor_vendido,
          utilidad: resumen?.utilidad,
          cuentas_cobrar: typeof cobrar === 'number' ? cobrar : cobrar?.total,
          cuentas_pagar: typeof pagar === 'number' ? pagar : pagar?.total,
          gastos: typeof gastos === 'number' ? gastos : gastos?.total,
        }]
      }

      setDatos({ tipo, lista, filtros: { ...filtros } })
      setPreviewVisible(true)
      setModalFiltros(false)
    } catch (err) {
      setError(err.message || 'Error al generar informe')
    } finally {
      setLoading(false)
    }
  }

  function imprimir() {
    const el = document.getElementById('informe-preview')
    if (!el) return
    const ventana = window.open('', '_blank')
    ventana.document.write(`
      <html><head><title>Informe</title>
      <style>body{font-family:sans-serif;padding:1rem} table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #ccc;padding:0.5rem;text-align:left}
      th{background:#f5f5f5}</style></head>
      <body>${el.innerHTML}</body></html>`)
    ventana.document.close()
    ventana.print()
    ventana.close()
  }

  function exportarExcel() {
    if (!datos?.lista?.length) return
    const cols = Object.keys(datos.lista[0]).filter((k) => typeof datos.lista[0][k] !== 'object')
    const rows = datos.lista.map((r) => cols.reduce((o, c) => { o[c] = r[c]; return o }, {}))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Informe')
    XLSX.writeFile(wb, `informe-${datos.tipo}-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  function exportarPDF() {
    const el = document.getElementById('informe-preview')
    if (!el) return
    window.print()
  }

  function buildPreviewTable() {
    if (!datos?.lista) return null
    const { tipo, lista, filtros: f } = datos
    const items = FILTROS_POR_INFORME[tipo] || []
    let columnasVisibles = items.filter((i) => i.type !== 'date' && i.type !== 'checkbox' && (f[i.key] === true || (i.default && f[i.key] !== false))).map((i) => i.key)
    if (tipo === 'inventario' && f.solo_costo_existencia) {
      columnasVisibles = ['codigo', 'descripcion', 'costo', 'existencia']
    }
    if (columnasVisibles.length === 0 && lista.length > 0) {
      columnasVisibles = Object.keys(lista[0]).filter((k) => typeof lista[0][k] !== 'object').slice(0, 8)
    }

    const mapKeyToLabel = {}
    items.forEach((i) => { mapKeyToLabel[i.key] = i.label })
    Object.assign(mapKeyToLabel, { codigo: 'Código', descripcion: 'Descripción', existencia: 'Existencia', numero_factura: 'Nº Factura', fecha_pago: 'Fecha pago' })
    const headers = columnasVisibles.map((k) => mapKeyToLabel[k] || k)

    let total = 0
    const isMoneda = (k) => ['monto', 'total', 'precio', 'costo', 'limite_credito', 'valor_vendido', 'cuentas_cobrar', 'cuentas_pagar', 'gastos'].includes(k)
    const isPorcentaje = (k) => tipo === 'inventario' && k === 'utilidad'

    return (
      <div id="informe-preview" className="informe-preview-wrap">
        <h3>Informe: {TIPOS_INFORME.find((t) => t.id === tipo)?.label}</h3>
        <p className="informe-fecha">Generado: {new Date().toLocaleString('es-VE')}</p>
        <table className="admin-table informe-tabla">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((row, i) => (
              <tr key={i}>
                {columnasVisibles.map((col) => {
                  const keyMap = { numero_factura: 'numero', fecha: 'fecha_pago', fecha_emision: 'fecha_pago', proveedor: 'proveedor_empresa', id: '_id', contacto: 'contacto_nombre' }
                  const rawKey = keyMap[col] || col
                  let val = row[rawKey] ?? row[col]
                  if (isPorcentaje(col) && (typeof val === 'number' || val != null)) {
                    val = `${Number(val)}%`
                  } else if (isMoneda(col) && typeof val === 'number') {
                    total += val
                    val = formatPrecio(val, bcv)
                  } else if (val == null) val = '—'
                  else if (typeof val === 'object') val = JSON.stringify(val)
                  return <td key={col}>{String(val)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {(tipo === 'ventas' || tipo === 'cuentas_cobrar' || tipo === 'cuentas_pagar' || tipo === 'gastos') && total > 0 && (
          <p className="informe-total"><strong>Total: {formatPrecio(total, bcv)}</strong></p>
        )}
      </div>
    )
  }

  return (
    <div className="admin-page admin-informes">
      <h1>Informes</h1>
      <p className="admin-welcome">Seleccione el tipo de informe, configure los filtros y genere la vista previa. Luego imprima o exporte a Excel/PDF.</p>

      <div className="informe-selector">
        <input
          type="text"
          placeholder="Buscar tipo de informe..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="informe-search"
        />
        <div className="informe-tipos-grid">
          {tiposFiltrados.map((t) => (
            <button
              key={t.id}
              type="button"
              className="informe-tipo-btn"
              onClick={() => abrirModal(t)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {loading && <p className="catalogo-loading">Generando informe...</p>}

      {previewVisible && datos && (
        <section className="admin-section informe-preview-section">
          <div className="informe-acciones">
            <button type="button" className="btn-hero" onClick={imprimir}>Imprimir</button>
            <button type="button" className="btn-aprobar" onClick={exportarExcel}>Exportar Excel</button>
            <button type="button" className="btn-secondary" onClick={exportarPDF}>Exportar PDF</button>
            <button type="button" className="btn-secondary" onClick={() => { setPreviewVisible(false); setModalFiltros(true); setInformeSeleccionado(TIPOS_INFORME.find((t) => t.id === datos.tipo)); setFiltros(datos.filtros || {}); }}>Cambiar filtros</button>
          </div>
          {buildPreviewTable()}
        </section>
      )}

      {modalFiltros && informeSeleccionado && (
        <div className="modal-overlay" onClick={() => setModalFiltros(false)}>
          <div className="modal-content modal-informes" onClick={(e) => e.stopPropagation()}>
            <h3>Filtros: {informeSeleccionado.label}</h3>
            <div className="informe-filtros">
              {(FILTROS_POR_INFORME[informeSeleccionado.id] || []).map((f) => (
                <label key={f.key} className="informe-filtro-item">
                  {f.type === 'checkbox' ? (
                    <>
                      <input
                        type="checkbox"
                        checked={!!filtros[f.key]}
                        onChange={(e) => handleFiltroChange(f.key, e.target.checked)}
                      />
                      <span>{f.label}</span>
                    </>
                  ) : f.type === 'date' ? (
                    <>
                      <span>{f.label}</span>
                      <input
                        type="date"
                        value={filtros[f.key] || ''}
                        onChange={(e) => handleFiltroChange(f.key, e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={!!filtros[f.key]}
                        onChange={(e) => handleFiltroChange(f.key, e.target.checked)}
                      />
                      <span>{f.label}</span>
                    </>
                  )}
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalFiltros(false)}>Cancelar</button>
              <button type="button" className="btn-hero" onClick={generarInforme} disabled={loading}>
                {loading ? 'Generando…' : 'Vista previa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

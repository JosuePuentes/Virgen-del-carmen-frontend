import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, getAdminToken } from '../../config/api'

const TIPO_FACTURA = 'factura'

export default function AdminFormatosImpresion() {
  const [formato, setFormato] = useState(null)
  const [form, setForm] = useState({
    tipo: TIPO_FACTURA,
    logo_url: '',
    titulo: 'FACTURA',
    mostrar_rif: true,
    mostrar_direccion: true,
    mostrar_telefono: true,
    campos_extra: '',
    layout: 'estandar',
  })
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await apiGet(`formatos-impresion/${TIPO_FACTURA}`, getAdminToken()).catch(() => null)
        if (data) {
          setFormato(data)
          setForm({
            tipo: data.tipo || TIPO_FACTURA,
            logo_url: data.logo_url || '',
            titulo: data.titulo || 'FACTURA',
            mostrar_rif: data.mostrar_rif !== false,
            mostrar_direccion: data.mostrar_direccion !== false,
            mostrar_telefono: data.mostrar_telefono !== false,
            campos_extra: data.campos_extra || '',
            layout: data.layout || 'estandar',
          })
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setGuardando(true)
    try {
      if (formato) {
        await apiPut(`formatos-impresion/${TIPO_FACTURA}`, form, getAdminToken())
        setExito('Formato actualizado.')
      } else {
        await apiPost('formatos-impresion/', form, getAdminToken())
        setExito('Formato creado.')
      }
      setFormato(form)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="admin-page">
      <h1>Formato de impresión</h1>
      <p className="admin-welcome">Configure el diseño de la factura: logo, campos visibles, layout.</p>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-success">{exito}</p>}

      {loading && <p className="catalogo-loading">Cargando...</p>}
      {!loading && (
        <form onSubmit={handleSubmit} className="admin-form">
          <label>
            URL del logo
            <input name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="https://..." />
          </label>
          <label>
            Título del documento
            <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="FACTURA" />
          </label>
          <label>
            Layout
            <select name="layout" value={form.layout} onChange={handleChange}>
              <option value="estandar">Estándar</option>
              <option value="compacto">Compacto</option>
              <option value="detallado">Detallado</option>
            </select>
          </label>
          <div className="admin-form-modulos">
            <span>Campos a mostrar:</span>
            <label className="admin-checkbox">
              <input type="checkbox" name="mostrar_rif" checked={form.mostrar_rif} onChange={handleChange} />
              RIF
            </label>
            <label className="admin-checkbox">
              <input type="checkbox" name="mostrar_direccion" checked={form.mostrar_direccion} onChange={handleChange} />
              Dirección
            </label>
            <label className="admin-checkbox">
              <input type="checkbox" name="mostrar_telefono" checked={form.mostrar_telefono} onChange={handleChange} />
              Teléfono
            </label>
          </div>
          <label>
            Campos extra (JSON o texto)
            <textarea name="campos_extra" value={form.campos_extra} onChange={handleChange} rows="3" placeholder='{"nota": "Gracias por su compra"}' />
          </label>
          <button type="submit" className="btn-hero" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar formato'}
          </button>
        </form>
      )}
    </div>
  )
}

/**
 * Módulos del panel admin. El usuario master selecciona qué permisos tiene cada usuario.
 * Cada key se envía al backend en el array `modulos` del usuario.
 * Si el usuario tiene `master` o `*` en modulos, ve todo.
 */
export const MODULOS_PERMISOS = [
  { key: 'solicitudes_clientes', label: 'Solicitudes de clientes' },
  { key: 'pedidos', label: 'Pedidos (Admin, Picking, Packing, Envíos, Crear, Facturación, Fallas)' },
  { key: 'inventario', label: 'Inventario' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'finanzas', label: 'Finanzas' },
  { key: 'cuentas_por_cobrar', label: 'Cuentas por cobrar' },
  { key: 'cuentas_por_pagar', label: 'Cuentas por pagar' },
  { key: 'facturas_finalizadas', label: 'Facturas finalizadas' },
  { key: 'gastos', label: 'Gastos' },
  { key: 'cierre_diario', label: 'Cierre diario' },
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'compras', label: 'Compras' },
  { key: 'ordenes_compra', label: 'Órdenes de compra' },
  { key: 'lista_comparativa', label: 'Lista comparativa' },
  { key: 'formatos_impresion', label: 'Formato de impresión' },
  { key: 'usuarios', label: 'Usuarios (crear y gestionar otros usuarios)' },
]

import { useEffect, useMemo, useState } from 'react'
import { api } from './services/api'
import SolicitudCard from './components/SolicitudCard'

function App() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [filtroPrioridad, setFiltroPrioridad] = useState('TODAS')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  // Formulario de nueva solicitud
  const [form, setForm] = useState({ titulo: '', prioridad: 'Media', estado: 'Pendiente' })
  const [guardando, setGuardando] = useState(false)
  const [erroresForm, setErroresForm] = useState({})

  useEffect(() => {
    const controller = new AbortController()
    async function cargar() {
      try {
        setCargando(true)
        setError('')
        const respuesta = await api.get('/solicitudes', { signal: controller.signal })
        setSolicitudes(respuesta.data)
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') setError('No fue posible consultar las solicitudes.')
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }
    cargar()
    return () => controller.abort()
  }, [])

  // creacion de nueva solicitud
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErroresForm({})

    try {
      const respuesta = await api.post('/solicitudes', form)
      // Agrega el elemento devuelto por el backend a la lista existente
      setSolicitudes(prev => [...prev, respuesta.data])
      // Resetear campos
      setForm({ titulo: '', prioridad: 'Media', estado: 'Pendiente' })
    } catch (err) {
      if (err.response && err.response.data) {
        // Muestra errores de validación de Spring Boot (Bad Request)
        setErroresForm(err.response.data)
      } else {
        alert('Error inesperado al conectar con el servidor')
      }
    } finally {
      setGuardando(false)
    }
  }

  // calculo de porcentajes
  const estadisticas = useMemo(() => {
    const total = solicitudes.length
    if (total === 0) return { total: 0, porEstado: [] }

    const conteos = solicitudes.reduce((acc, item) => {
      const estado = item.estado || 'Sin estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    const porEstado = Object.entries(conteos).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje: ((cantidad / total) * 100).toFixed(1)
    }))

    return { total, porEstado }
  }, [solicitudes])

  // filtrado
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(item => {
      const coincidePrioridad = filtroPrioridad === 'TODAS' || item.prioridad === filtroPrioridad
      const coincideEstado = filtroEstado === 'TODOS' || item.estado === filtroEstado
      return coincidePrioridad && coincideEstado
    })
  }, [solicitudes, filtroPrioridad, filtroEstado])

  return (
      <main>
        <h1>Solicitudes desde Spring Boot</h1>

        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1.5rem', borderRadius: '6px' }}>
          <h3>Registrar nueva solicitud</h3>

          <div>
            <label>Título: </label>
            <input
                type="text"
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                disabled={guardando}
            />
            {erroresForm.titulo && <p style={{ color: 'red', margin: '4px 0' }}>{erroresForm.titulo}</p>}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label>Prioridad: </label>
            <select
                value={form.prioridad}
                onChange={e => setForm({ ...form, prioridad: e.target.value })}
                disabled={guardando}
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
            {erroresForm.prioridad && <p style={{ color: 'red', margin: '4px 0' }}>{erroresForm.prioridad}</p>}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label>Estado: </label>
            <select
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value })}
                disabled={guardando}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Resuelta">Resuelta</option>
            </select>
            {erroresForm.estado && <p style={{ color: 'red', margin: '4px 0' }}>{erroresForm.estado}</p>}
          </div>

          {erroresForm.error && <p style={{ color: 'red' }}>{erroresForm.error}</p>}

          <button type="submit" disabled={guardando} style={{ marginTop: '0.8rem' }}>
            {guardando ? 'Guardando...' : 'Crear solicitud'}
          </button>
        </form>

        {!cargando && !error && (
            <section style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h2>Resumen general</h2>
              <p><strong>Total de solicitudes:</strong> {estadisticas.total}</p>
              <ul>
                {estadisticas.porEstado.map(({ estado, cantidad, porcentaje }) => (
                    <li key={estado}><strong>{estado}:</strong> {cantidad} ({porcentaje}%)</li>
                ))}
              </ul>
            </section>
        )}

        <section style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
          <div>
            <label>Prioridad: </label>
            <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}>
              <option value="TODAS">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div>
            <label>Estado: </label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="TODOS">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Resuelta">Resuelta</option>
            </select>
          </div>
        </section>

        {cargando && <p role="status">Cargando solicitudes...</p>}
        {error && <p role="alert">{error}</p>}
        {!cargando && !error && solicitudesFiltradas.length === 0 && <p>No hay solicitudes que coincidan.</p>}
        {!cargando && !error && solicitudesFiltradas.map(s => <SolicitudCard key={s.id} {...s} />)}
      </main>
  )
}

export default App
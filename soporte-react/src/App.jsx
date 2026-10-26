import { useEffect, useMemo, useState } from 'react'
import { api } from './services/api'
import SolicitudCard from './components/SolicitudCard'

function App() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [filtroPrioridad, setFiltroPrioridad] = useState('TODAS')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  useEffect(() => {
    const controller = new AbortController()

    async function cargar() {
      try {
        setCargando(true)
        setError('')
        const respuesta = await api.get('/solicitudes', {
          signal: controller.signal
        })
        setSolicitudes(respuesta.data)
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') {
          setError('No fue posible consultar las solicitudes.')
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargar()
    return () => controller.abort()
  }, [])

  // calculo de porcentajes
  const estadisticas = useMemo(() => {
    const total = solicitudes.length

    // manejo de lista vacia
    if (total === 0) {
      return {
        total: 0,
        porEstado: []
      }
    }

    // agrupacion por estado
    const conteos = solicitudes.reduce((acc, item) => {
      const estado = item.estado || 'Sin estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    // conversion a arreglo
    const porEstado = Object.entries(conteos).map(([estado, cantidad]) => {
      const porcentaje = total > 0 ? (cantidad / total) * 100 : 0
      return {
        estado,
        cantidad,
        porcentaje: porcentaje.toFixed(1) // 1 decimal (ej: "33.3")
      }
    })

    return { total, porEstado }
  }, [solicitudes])

  // filtrado
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(item => {
      const coincidePrioridad =
          filtroPrioridad === 'TODAS' || item.prioridad === filtroPrioridad
      const coincideEstado =
          filtroEstado === 'TODOS' || item.estado === filtroEstado

      return coincidePrioridad && coincideEstado
    })
  }, [solicitudes, filtroPrioridad, filtroEstado])

  return (
      <main>
        <h1>Solicitudes desde Spring Boot</h1>

        {!cargando && !error && (
            <section style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
              <h2>Resumen general</h2>
              <p><strong>Total de solicitudes:</strong> {estadisticas.total}</p>

              {estadisticas.total === 0 ? (
                  <p>No hay datos suficientes para calcular porcentajes.</p>
              ) : (
                  <ul>
                    {estadisticas.porEstado.map(({ estado, cantidad, porcentaje }) => (
                        <li key={estado}>
                          <strong>{estado}:</strong> {cantidad} ({porcentaje}%)
                        </li>
                    ))}
                  </ul>
              )}
            </section>
        )}

        <section style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
          <div>
            <label htmlFor="filtro-prioridad">Prioridad: </label>
            <select
                id="filtro-prioridad"
                value={filtroPrioridad}
                onChange={e => setFiltroPrioridad(e.target.value)}
                disabled={cargando || Boolean(error)}
            >
              <option value="TODAS">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div>
            <label htmlFor="filtro-estado">Estado: </label>
            <select
                id="filtro-estado"
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                disabled={cargando || Boolean(error)}
            >
              <option value="TODOS">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Resuelta">Resuelta</option>
            </select>
          </div>
        </section>

        {cargando && <p role="status">Cargando solicitudes...</p>}
        {error && <p role="alert">{error}</p>}

        {!cargando && !error && solicitudesFiltradas.length === 0 && (
            <p>No hay solicitudes que coincidan con los criterios.</p>
        )}

        {!cargando && !error && solicitudesFiltradas.map(s => (
            <SolicitudCard key={s.id} {...s} />
        ))}
      </main>
  )
}

export default App
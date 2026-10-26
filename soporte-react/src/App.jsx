import { useEffect, useMemo, useState } from 'react'
import { api } from './services/api'
import SolicitudCard from './components/SolicitudCard'

function App() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // filtros por prioridad y estado
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

          {(filtroPrioridad !== 'TODAS' || filtroEstado !== 'TODOS') && (
              <button
                  type="button"
                  onClick={() => {
                    setFiltroPrioridad('TODAS')
                    setFiltroEstado('TODOS')
                  }}
              >
                Limpiar filtros
              </button>
          )}
        </section>

        {cargando && <p role="status">Cargando solicitudes...</p>}
        {error && <p role="alert">{error}</p>}

        {!cargando && !error && solicitudes.length === 0 && (
            <p>No hay solicitudes registradas.</p>
        )}

        {!cargando && !error && solicitudes.length > 0 && solicitudesFiltradas.length === 0 && (
            <p>No se encontraron solicitudes que coincidan con los filtros seleccionados.</p>
        )}

        {!cargando && !error && solicitudesFiltradas.map(s => (
            <SolicitudCard key={s.id} {...s} />
        ))}
      </main>
  )
}

export default App
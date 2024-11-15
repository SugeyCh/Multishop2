import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import FooterGraph from './Footer'
import BarChartComponent from './BarChart'
import PieChartComponent from './PieChart'
import LineChartComponent from './AreaChart'
import { defaultChartTypes } from '@conf/defaultChartTypes'
import GraphTypeModal from './GraphType'
import { 
  Sun, 
  Moon, 
  NotFound, 
  ArrowLeft, 
  Options 
} from './Icons'

export default function Graph() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [chartDataState, setChartDataState] = useState(null)
  const [nameGraph, setNameGraph] = useState('')
  const [dateGraph, setDateGraph] = useState('')
  const [currentGraphType, setCurrentGraphType] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false) 
  const [noDataMessage, setNoDataMessage] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    const savedCategory = localStorage.getItem('selectedCategory')
    setCategory(savedCategory || '')
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    loadName()
    loadChartData()
  }, [])

  const loadChartData = () => {
    const storedChartData = localStorage.getItem('chartData')
    const storedNoDataMessage = localStorage.getItem('noDataMessage')
    
    if (storedNoDataMessage) {
      setNoDataMessage(storedNoDataMessage)
      localStorage.removeItem('noDataMessage')
    }
    
    if (storedChartData) {
      try {
        const parsedData = JSON.parse(storedChartData)
        console.log('Loaded chart data:', parsedData)
        setChartDataState(parsedData)
      } catch (error) {
        console.error('Error parsing chart data:', error)
        setNoDataMessage('Error al cargar los datos del gráfico.')
      }
    }
  }

  useEffect(() => {
    const selectedGraphType = localStorage.getItem('selectedGraphType')
    const defaultGraphType = defaultChartTypes[nameGraph] || 'Barra'
    setCurrentGraphType(selectedGraphType || defaultGraphType)
  }, [nameGraph])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)
  }

  const loadName = () => {
    const res = localStorage.getItem('selectedGraphName')
    const date = JSON.parse(localStorage.getItem('dateRange'))
    if (date) {
      const from = new Date(date.from).toLocaleDateString('en-CA')
      const to = new Date(date.to).toLocaleDateString('en-CA')

      setNameGraph(res)
      setDateGraph(`${from} / ${to}`)
    }
  }

  const renderChart = () => {
    if (noDataMessage) {
      return (
        <div className='not-found'>
          <div className="icon-not-found">
            <NotFound />
          </div>
          <span>{noDataMessage}</span>
        </div>
      )
    }

    if (!chartDataState) {
      return <div>Cargando datos...</div>
    }

    if (category === 'Estadísticos') return renderStatisticalData()

    const chartData = chartDataState.results || chartDataState
    console.log(chartData);
    

    switch (currentGraphType) {
      case 'Barra':
        return <BarChartComponent data={chartData} dateRange={chartDataState.dateRange} />
      case 'Torta':
        return <PieChartComponent data={chartData} dateRange={chartDataState.dateRange} />
      case 'Línea':
        return <LineChartComponent data={chartData} dateRange={chartDataState.dateRange} />
      default:
        return (
          <div className='not-found'>
            <div className="icon-not-found">
              <NotFound />
            </div>
            <span>
              No se ha seleccionado ningún tipo de gráfico válido.
            </span>
          </div>
        )
    }
  }

  const renderStatisticalData = () => {
    console.log('Statistical Data:', chartDataState)
    
    if (!chartDataState || Object.keys(chartDataState).length === 0) {
      return <div>No hay datos estadísticos disponibles.</div>
    }
  
    const dataEntries = Object.entries(chartDataState).filter(([key]) => key !== 'dateRange')
  
    const getFieldName = (key) => {
      const fieldNames = {
        nom_op_bs: 'Nombre',
        cod_op_bs: 'Código',
        nom_clibs: 'Cliente',
        cod_clibs: 'Código Cliente',
        nom_fab_bs: 'Fabricante',
        cod_fab_bs: 'Código Fabricante',
        nom_art_bs: 'Producto',
        cod_art_bs: 'Código Producto',
        numero_operaciones: 'N° de Operaciones',
        unidades_vendidas: 'Unidades Vendidas',
        fecha: 'Fecha',
        total_ventas: 'Total Ventas'
      }
      return fieldNames[key] || key
    }

    return (
      <div className="statistical-data w-full max-w-md p-6">
        <div className="flow-root">
          <ul role="list" className="divide-y">
            {dataEntries.map(([key, value]) => (
              <li key={key} className="statistical-item py-10 sm:py-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 ms-4">
                    {Object.entries(value).map(([fieldKey, fieldValue]) => {
                      if (fieldKey === 'id' || fieldKey === 'total_ventas') return null;
                      if (fieldKey === 'fecha') {
                        return (
                          <p key={fieldKey} className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {getFieldName(fieldKey)}: {new Date(fieldValue).toLocaleDateString()}
                          </p>
                        )
                      } else if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
                        return (
                          <p key={fieldKey} className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {getFieldName(fieldKey)}: {fieldValue}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    ${parseFloat(value.total_ventas).toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const backRouter = (e) => {
    e.preventDefault()
    router.push('/listkpi')
  }

  const handleOpenModal = () => { setIsModalOpen(true) }

  const handleCloseModal = () => { setIsModalOpen(false) }

  const handleSaveGraphType = (newGraphType) => {
    setCurrentGraphType(newGraphType)
    localStorage.setItem('selectedGraphType', newGraphType)
    setIsModalOpen(false)
  }

  return (
    <div className="body">
      <div className="calendar gra-content">
        <div className="graph-option">
          <div className="graph-type" onClick={handleOpenModal}>
            <Options />
          </div>

          <div className="mood">
            <button className={`mood-btn ${darkMode ? 'dark' : ''}`} onClick={toggleDarkMode}>
              <Sun className="icon" />
              <div className="circle2"></div>
              <Moon className="icon" />
            </button>
          </div>
        </div>

        <div className="graph__body">
          <div className="graph__header">
            <div className="content-header">
              <div className="graph__header__title">{nameGraph}</div>
              <div className="graph__header__data">
                <span>Periodo: {dateGraph}</span>
              </div>
            </div>
          </div>
          <div className="graph__body__content">
            {renderChart()}
          </div>

          <div className="button__graph">
            <button className='btn' onClick={backRouter}>
              <ArrowLeft />
              <span>Atrás</span>
            </button>
          </div>
        </div>

        <FooterGraph />
      </div>

      {isModalOpen && category !== 'Estadísticos' && (
        <GraphTypeModal
          onClose={handleCloseModal}
          onSave={handleSaveGraphType}
          selectedGraphName={nameGraph}
        />
      )}
    </div>
  )
}
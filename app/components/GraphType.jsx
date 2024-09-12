import React, { useState, useEffect } from 'react'
import { CloseModal, BarGraph, CircularGraph, LineGraph } from './Icons'
import { defaultChartTypes } from '@conf/defaultChartTypes'

const GraphTypeModal = ({ onClose, onSave, selectedGraphName }) => {
  const [currentSelectedGraphType, setCurrentSelectedGraphType] = useState('')
  const [closing, setClosing] = useState(false)

  const graphTypes = [
    { name: 'Barra', icon: <BarGraph /> },
    { name: 'Torta', icon: <CircularGraph /> },
    { name: 'Línea', icon: <LineGraph /> },
  ]

  useEffect(() => {
    const savedGraphType = localStorage.getItem('selectedGraphType')
    if (savedGraphType) {
      setCurrentSelectedGraphType(savedGraphType)
    } else {
      const defaultType = defaultChartTypes[selectedGraphName] || 'Barra'
      setCurrentSelectedGraphType(defaultType)
    }
  }, [selectedGraphName])

  const handleItemClick = (graphType) => {
    setCurrentSelectedGraphType(graphType.name)
  }

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      onClose()
      setClosing(false)
    }, 300)
  }

  const handleSave = () => {
    onSave(currentSelectedGraphType)
    localStorage.setItem('selectedGraphType', currentSelectedGraphType)
    handleClose()
  }

  return (
    <div className={`modal-type ${closing ? 'fade-out' : 'fade-in'}`}>
      <div className={`modal-content-type ${closing ? 'fade-out' : 'fade-in'}`}>
        <span className="close-button" onClick={handleClose}>
          <CloseModal />
        </span>
        <h2 className="ti-graph">Tipos de Gráficos</h2>
        <ul className="li">
          {graphTypes.map((graphType, index) => (
            <li 
              key={index} 
              className={`separate ${currentSelectedGraphType === graphType.name ? 'selected' : ''}`}
              onClick={() => handleItemClick(graphType)}
            >
              <div className="list">
                <div className="graph-icon">
                  {graphType.icon}
                </div>
                <div className="gra-li">
                  {graphType.name}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="save-button-container">
          <button onClick={handleSave} disabled={!currentSelectedGraphType}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default GraphTypeModal
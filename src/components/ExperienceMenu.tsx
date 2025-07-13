import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function VListTab(props: any) {
  const { theme } = useTheme()

  const handleClick = () => {
    props.onClick(props.index)
  }

  return (
    <li key={props.index} className='list-none text-left p-0'>
      <button
        onClick={handleClick}
        className={`
          border-l-4 border-solid
          text-left
          py-2 px-3
          whitespace-normal break-words
        `}
        style={
          props.activeTabId === props.index
            ? { color: theme.main_color, borderColor: theme.main_color }
            : { color: theme.sub_color, borderColor: theme.sub_color }
        }
      >
        {props.data.company}
      </button>
    </li>
  )
}

function VListContent(props: any) {
  const { theme } = useTheme()
  const data = props.data

  return (
    <div
      key={props.index}
      className='text-left'
      style={{
        display: props.activeTabId === props.index ? 'block' : 'none'
      }}
    >
      <h4 style={{ color: theme.text_color }}>{data.position}</h4>
      <h5 style={{ color: theme.main_color }}>{data.period}</h5>

      {data.details.map((detail: string, idx: number) => (
        <p
          key={idx}
          className='mb-5 text-xs'
          style={{ color: theme.sub_color }}
        >
          {detail}
        </p>
      ))}
    </div>
  )
}

export default function ExperienceMenu(props: any) {
  const [activeTabId, setActiveTabId] = useState(0)

  function onClick(id: number) {
    setActiveTabId(id)
  }

  return (
    <div className='container relative max-w-full min-h-[30rem] mt-5'>
      <div className='row flex flex-wrap'>
        {/* Columna de empresas */}
        <div className='col sm:col-4 w-full sm:w-1/3'>
          <ul className='p-0'>
            {props.data.map((job: any, index: number) => (
              <VListTab
                key={index}
                onClick={onClick}
                data={job}
                index={index}
                activeTabId={activeTabId}
              />
            ))}
          </ul>
        </div>

        {/* Columna de contenidos */}
        <div className='col sm:col-8 w-full sm:w-2/3'>
          {props.data.map((job: any, index: number) => (
            <VListContent
              key={index}
              data={job}
              index={index}
              activeTabId={activeTabId}
            />
          ))}
        </div>
      </div>

      {/* Indicador visual (la barra móvil) */}
      <span
        className={
          activeTabId === 0
            ? 'index1-chosen'
            : activeTabId === 1
            ? 'index2-chosen'
            : 'index3-chosen'
        }
      >
        &nbsp;
      </span>
    </div>
  )
}

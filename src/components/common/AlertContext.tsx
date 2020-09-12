import React, { Context, createContext, FunctionComponent, useContext, useState } from 'react'
import AlertDialog from './AlertDialog'

export interface AlertMessage {
  title: string
  message: string | Element
}

export type AlertFunction = (s: string | AlertMessage) => void

export const withAlertQueue = (WrappedComponent: FunctionComponent): FunctionComponent => {
  const AlertWrapper: FunctionComponent = props => {
    const [queue, setQueue] = useState<AlertMessage[]>([])

    const popAlert = (): void => {
      setQueue(queue.slice(1))
    }

    const queueAlert: AlertFunction = (s: string | AlertMessage): void => {
      const message: AlertMessage = typeof s === 'string' ? { title: 'Alert', message: s } : s
      setQueue(queue.concat([message]))
    }

    const alertNodes = queue.map((message, i) => (
      <AlertDialog key={i} isOpen={i === 0} title={message.title} onClose={popAlert}>
        {message.message}
      </AlertDialog>
    ))

    return (
      <AlertContext.Provider value={queueAlert}>
        <WrappedComponent {...props}/>
        {alertNodes}
      </AlertContext.Provider>
    )
  }

  return AlertWrapper
}

export const useAlert = (): AlertFunction => useContext(AlertContext)
export const AlertContext: Context<AlertFunction> = createContext<AlertFunction>(window.alert)
AlertContext.displayName = 'AlertContext'

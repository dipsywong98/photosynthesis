import React, { Context, createContext, FunctionComponent, useCallback, useContext, useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

export interface ConfirmMessage {
  title: string
  message: string | Element
}

export interface Confirm {
  message: ConfirmMessage
  resolve: (result: boolean) => void
}

export type ConfirmFunction = (s: string) => Promise<boolean>

export const withConfirmQueue = (WrappedComponent: FunctionComponent): FunctionComponent => {
  const ConfirmWrapper: FunctionComponent = props => {
    const [queue, setQueue] = useState<Confirm[]>([])

    const popAlert = (): void => {
      setQueue(queue.slice(1))
    }

    const queueConfirm: ConfirmFunction = useCallback(async (s: string | ConfirmMessage): Promise<boolean> => {
      const message: ConfirmMessage = typeof s === 'string' ? { title: 'Alert', message: s } : s
      return await new Promise((resolve) => {
        setQueue(queue.concat([{ message, resolve }]))
      })
    }, [queue])

    const confirmNodes = queue.map(({ message, resolve }, i) => (
      <ConfirmDialog
        key={i}
        isOpen={i === 0}
        title={message.title}
        onAction={resolve}
        onClose={popAlert}>
        {message.message}
      </ConfirmDialog>
    ))

    return (
      <ConfirmContext.Provider value={queueConfirm}>
        <WrappedComponent {...props}/>
        {confirmNodes}
      </ConfirmContext.Provider>
    )
  }

  return ConfirmWrapper
}

export const useConfirm = (): ConfirmFunction => useContext(ConfirmContext)
const defaultConfirm: ConfirmFunction = async (message) => await new Promise((resolve) => resolve(window.confirm(message)))
export const ConfirmContext: Context<ConfirmFunction> = createContext<ConfirmFunction>(defaultConfirm)
ConfirmContext.displayName = 'ConfirmContext'

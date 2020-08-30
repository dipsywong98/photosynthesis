import React, { createContext, FunctionComponent, useContext } from 'react'
import axios from 'axios'

const AxiosContext = createContext(axios)
AxiosContext.displayName = 'AxiosContext'

export const AxiosProvider: FunctionComponent = props => {
  axios.defaults.headers['Content-Type'] = 'application/json'
  // @ts-expect-error
  global.axios = axios
  return <AxiosContext.Provider value={axios}>
    {props.children}
  </AxiosContext.Provider>
}

export const useAxios = () => useContext(AxiosContext)

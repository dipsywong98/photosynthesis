import React, { FunctionComponent, useState } from 'react'
import { Flex, Heading, Text } from '@theme-ui/components'
import Input from './common/Input'
import PropTypes from 'prop-types'
import Button from './common/Button'
import Well from './common/Well'
import { useRoom } from '../lib/RoomContext'
import { AppState } from './App'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export const Home: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const room = useRoom()
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState(window.location.pathname.match(/^\/(.*)$/)?.[1] ?? '')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const createRoom = () => {
    setMessage('Creating Room...')
    setLoading(true)
    room.create(name, roomCode)
      .then(() => {
        setError('')
        setState(AppState.ROOM)
      })
      .catch(e => {
        if (e.type === 'unavailable-id') {
          setError(`Room ${roomCode} already exists`)
        } else {
          setError('Error when creating room')
        }
        console.log(e)
      })
      .finally(() => {
        setMessage('')
        setLoading(false)
      })
  }
  const joinRoom = () => {
    setMessage('Joining Room...')
    setLoading(true)
    room.join(name, roomCode)
      .then(() => {
        setError('')
        setState(AppState.ROOM)
      })
      .catch(e => {
        setError(`Room '${roomCode}' does not exist`)
        console.log(e)
      })
      .finally(() => {
        setMessage('')
        setLoading(false)
      })
  }
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Heading>Welcome to Whatever Game</Heading>
      {
        error !== '' && (
          <Well variant='danger'>{error}</Well>
        )
      }
      <Input
        fullwidth={true}
        disabled={loading}
        label='Name'
        onChange={({ target }) => setName?.(target.value)}
        value={name}
      />
      <Input
        fullwidth={true}
        disabled={loading}
        label='Room'
        onChange={({ target }) => setRoomCode?.(target.value.toUpperCase())}
        value={roomCode}
      />
      <Flex mt={3}>
        <Button sx={{ flex: 1 }} disabled={loading || name === ''} variant='warning' onClick={createRoom}>New
          Room</Button>
        <Button sx={{ flex: 1 }} disabled={loading || name === ''} ml={3} variant='primary' onClick={joinRoom}>Join
          Room</Button>
      </Flex>
      <Text>{message}</Text>
    </Flex>
  )
}

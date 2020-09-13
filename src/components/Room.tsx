import React, { FunctionComponent, useEffect, useState } from 'react'
import { Divider, Flex, Heading } from '@theme-ui/components'
import Input from './common/Input'
import PropTypes from 'prop-types'
import Button from './common/Button'
import { useRoom } from '../lib/RoomContext'
import { PlayersDict, RoomEvents } from '../lib/Room'
import IconText from './common/IconText'
import { mdiAccount, mdiCrown } from '@mdi/js'
import { AppState } from './App'
import { Game } from '../Game/Game'
import { useAlert } from './common/AlertContext'

const propTypes = {
  setState: PropTypes.func.isRequired
}

export const Room: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = ({ setState }) => {
  const room = useRoom()
  const [players, setPlayers] = useState<PlayersDict>({})
  const [host, setHost] = useState('')
  const alert = useAlert()
  const name = players[room.myId] ?? ''
  const rename = room.rename
  useEffect(() => {
    room.on(RoomEvents.SET_PLAYERS, ({ data }) => setPlayers(data as PlayersDict))
    room.on(RoomEvents.SET_HOST, ({ data }) => setHost(data as string))
    room.on(RoomEvents.START_GAME, ({ data: game }) => {
      setState(AppState.GAME, game as Game)
    })
  }, [room, setState])
  const startGame = (): void => {
    room?.startGame().catch((e: Error) => {
      console.log(e)
      alert(e.message)
    })
  }
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Heading>{room.roomCode}</Heading>
      <Input
        label='My Name'
        value={name}
        onChange={async ({ target }: InputEvent) => {
          await rename((target as HTMLInputElement)?.value ?? '')
        }}
      />
      <Divider my={3}/>
      <Flex sx={{ flexDirection: 'column' }}>
        {
          Object.entries(players).map(([id, name]) => (
            id === host
              ? <IconText key={id} path={mdiCrown}>{name}{id === room.myId && ' (me)'}</IconText>
              : <IconText key={id} path={mdiAccount}>{name}{id === room.myId && ' (me)'}</IconText>
          ))
        }
      </Flex>
      <Divider my={3}/>
      <Flex>
        <Button
          sx={{ flex: 1 }}
          variant='warning'
          onClick={(): void => {
            setState(AppState.HOME)
          }}>
          Back
        </Button>
        <Button
          sx={{ flex: 1, visibility: (host === room.myId ? null : 'hidden') }}
          ml={3}
          variant='primary'
          onClick={host === room.myId ? startGame : undefined}>
          Start
        </Button>
      </Flex>
    </Flex>
  )
}

Room.propTypes = propTypes

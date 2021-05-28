import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps, Validator } from 'prop-types'
import { Box, Flex, Heading } from '@theme-ui/components'
import { ACTION_COST_GROW, ACTION_COST_PURCHASE, ACTION_COST_SEED, Color, GrowthStage } from '../../3d/constants'
import { useGame } from '../../Game/GameContext'
import { Room } from '../../lib/Room'
import { useColorMode } from '@theme-ui/color-modes'
import { colorsFromPlayerColor } from '../../utils/colors'
import { ImageStack } from '../common/ImageStack'
import { getTreeImageByColorGrowthStage } from '../TreeTokenStack'
import { SunlightBadge } from '../SunlightBadge'
import { GameActions } from '../../Game/Game'
import { InteractionState } from '../GamePlayer'
import { darken } from 'polished'
import IconText from '../common/IconText'
import { mdiLeaf, mdiWhiteBalanceSunny } from '@mdi/js'
import { reverse } from 'ramda'
import { TreeSlot } from './TreeSlot'

const GROWTH_STAGE_SIZES: { [k in GrowthStage]: number[] } = {
  [GrowthStage.SEED]: [45, 50],
  [GrowthStage.SHORT]: [45, 50],
  [GrowthStage.MID]: [65, 76],
  [GrowthStage.TALL]: [98, 115]
}

const stationProps = {
  playerColor: PropTypes.number.isRequired as Validator<Color>,
  interactionStateReducer: PropTypes.func.isRequired as Validator<(patch: Partial<InteractionState>) => void>
}

type StationProps = InferProps<typeof stationProps>

const Station: FunctionComponent<StationProps> = ({ playerColor, interactionStateReducer }) => {
  const [game] = useGame()
  const [colorMode] = useColorMode()

  const state = game.state
  if (state === undefined) {
    return null
  }

  const [bg, text] = colorsFromPlayerColor(colorMode, playerColor)

  const playerInfo = state.playerInfo[playerColor]
  const isMine = game.mi === playerColor
  const possessiveNoun = isMine ? 'My' : (Room.getName(game.room.state, playerColor) + '\'s')

  const handlerAvailableTokenClick = (growthStage: GrowthStage): void => {
    if (growthStage === GrowthStage.SEED) {
      interactionStateReducer({ action: GameActions.PLANT_SEED })
    } else {
      interactionStateReducer({ action: GameActions.GROW_TREE, growthStage: growthStage - 1 })
    }
  }

  return (
    <Flex
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100vw',
        maxWidth: ['320px', '380px'],
        flexDirection: 'column',
        borderTopLeftRadius: 2,
        backgroundColor: 'bgPales.0'
      }}>
      <Box
        mt={2}
        ml={3}
        sx={{
          color: text,
          fontSize: 4,
          textShadow: '0 3px 6px rgba(0, 0, 0, 0.2)'
        }}>{possessiveNoun} Station</Box>
      <Flex
        px={3}
        py={1}
        sx={{
          boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.3)',
          background: `linear-gradient(to bottom, ${darken(0.15)(bg)}, ${darken(0.1)(bg)})`,
          flexDirection: 'row',
          '> *': { flex: 1 }
        }}>
        <IconText
          path={mdiWhiteBalanceSunny}
          color='text'
          mr={2}
          size={['16px', '20px']}
          iconMargin={2}>
          {playerInfo.lightPoint}
        </IconText>
        <IconText
          path={mdiLeaf}
          color='text'
          size={['16px', '20px']}
          iconMargin={2}>
          {playerInfo.score}
        </IconText>
      </Flex>
      <Flex
        mt={2}
        sx={{
          position: 'relative',
          flexDirection: 'column'
        }}>
        <Heading mb={1} variant='subheading' ml={3}>Available</Heading>
        <Flex ml={3}>{Object.entries(playerInfo.availableArea).map(([growthStage, amount]) => {
          const cost = Number.parseInt(growthStage) === GrowthStage.SEED ? ACTION_COST_SEED : ACTION_COST_GROW[Number.parseInt(growthStage) - 1 as GrowthStage]
          return (
            <Box key={growthStage} sx={{ position: 'relative' }}>
              <ImageStack
                key={growthStage}
                onClick={(isMine && playerInfo.lightPoint >= cost && (state.preparingRound <= 0 || growthStage === GrowthStage.SHORT.toString())) ? () => handlerAvailableTokenClick(Number.parseInt(growthStage)) : undefined}
                imgPath={getTreeImageByColorGrowthStage(playerInfo.color, Number.parseInt(growthStage))}
                enabled={amount === 0 ? [false] : undefined}
                stack={new Array(Math.max(1, amount)).fill(
                  <SunlightBadge
                    myPoints={playerInfo.lightPoint}
                    sx={{
                      top: 0,
                      right: '-4px',
                      position: 'absolute'
                    }}>
                    {cost}
                  </SunlightBadge>
                )}
                badge={amount}
              />
            </Box>
          )
        })}
        </Flex>
      </Flex>
      <Flex
        sx={{
          position: 'relative',
          flexDirection: 'column'
        }}>
        <Heading mb={1} variant='subheading' ml={3}>Player Board</Heading>
        <Flex
          sx={{
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            padding: '4px',
            pb: '30px',
            ml: 2,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: text,
            borderTopLeftRadius: 1,
            borderRight: 'none',
            borderBottom: 'none'
          }}>
          {Object.entries(playerInfo.playerBoard).map(([key, slots]) => {
            const growthStage = Number.parseInt(key) as GrowthStage
            const size = GROWTH_STAGE_SIZES[growthStage]
            return (
              <Flex
                key={key}
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                {reverse(slots).map((isAvailable, i, arr) => (
                  <TreeSlot
                    key={i}
                    size={size}
                    color={playerColor}
                    growthStage={growthStage}
                    isAvailable={isAvailable}
                    costingPoints={ACTION_COST_PURCHASE[growthStage][arr.length - 1 - i]}
                    myPoints={playerInfo.lightPoint}
                  />
                ))}
              </Flex>
            )
          })}
        </Flex>
      </Flex>
    </Flex>
  )
}

Station.propTypes = stationProps

export default Station

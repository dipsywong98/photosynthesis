import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import { Box, BoxProps, Flex, useColorMode } from 'theme-ui'
import { Color, COLOR_VALUES, GrowthStage } from '../../3d/constants'
import { useGame } from '../../Game/GameContext'
import { darken, lighten, transparentize } from 'polished'

import { reverse } from 'ramda'
import IconText from '../common/IconText'
import { mdiLeaf, mdiWhiteBalanceSunny } from '@mdi/js'
import { SLOW, transition } from '../../theme/transitions'
import { colorsFromPlayerColor } from '../../utils/colors'

const stationProps = {
  playerColor: PropTypes.number.isRequired as PropTypes.Validator<Color>
}

type StationIndicatorProps = InferProps<typeof stationProps>

const GROWTH_STAGE_SYMBOLS: { [k in GrowthStage]: string } = {
  [GrowthStage.SEED]: '◊',
  [GrowthStage.SHORT]: 'S',
  [GrowthStage.MID]: 'M',
  [GrowthStage.TALL]: 'L'
}

const GROWTH_STAGE_SIZES: { [k in GrowthStage]: number[] } = {
  [GrowthStage.SEED]: [8, 10],
  [GrowthStage.SHORT]: [8, 10],
  [GrowthStage.MID]: [11, 15],
  [GrowthStage.TALL]: [17, 25]
}

// 6, 8, 4, 2

const StationIndicator: FunctionComponent<StationIndicatorProps & BoxProps> = ({ playerColor, ...boxProps }) => {
  const [colorMode] = useColorMode()
  const [game] = useGame()
  if (game.state === undefined) {
    return null
  }
  const playerName = game.room.whoami(playerColor.toString())
  const playerInfo = game.state.playerInfo[playerColor]
  const { sx, ...otherProps } = boxProps
  const color = '#' + COLOR_VALUES[playerColor].toString(16)
  const [bg, text] = colorsFromPlayerColor(colorMode, playerColor)

  return (
    <Flex
      sx={{
        width: 'calc(25vw - 8px)',
        mx: '4px',
        maxWidth: '150px',
        flexDirection: 'column',
        bg: 'bgs.2',
        borderRadius: 2,
        padding: 1,
        color: 'text',
        boxShadow: 1,
        ...transition(SLOW, ['transform']),
        transform: playerColor === game.state.turn ? 'translateY(8px)' : 'translateY(30px)',
        pointerEvents: 'all',
        cursor: 'pointer',
        ...sx
      }}
      {...otherProps}>
      <Box
        sx={{
          textAlign: 'center',
          background: `linear-gradient(to right, ${darken(0.05)(bg)}, ${lighten(0.05)(bg)})`,
          fontWeight: 'bold',
          padding: 1
        }}>
        {playerName}
      </Box>
      <Flex
        px={2}
        py={1}
        sx={{
          boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.3)',
          background: `linear-gradient(to bottom, ${darken(0.15)(bg)}, ${darken(0.1)(bg)})`,
          flexDirection: 'row',
          '> *': { flex: 1 }
        }}>
        <IconText path={mdiWhiteBalanceSunny} color='text' mr={2} size={['12px', '16px']} iconMargin={[1, 2]}>{playerInfo.lightPoint}</IconText>
        <IconText path={mdiLeaf} color='text' size={['12px', '16px']} iconMargin={[1, 2]}>{playerInfo.score}</IconText>
      </Flex>
      <Flex
        sx={{
          flexDirection: 'column',
          lineHeight: 1,
          backgroundImage: `radial-gradient(farthest-side at bottom, ${transparentize(0.8)(color)}, transparent)`,
          backgroundSize: '200% 60%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          backgroundColor: 'bgs.1',
          color: 'text',
          boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.3)',
          alignItems: 'center',
          fontSize: ['12px', '16px']
        }}>
        <Flex
          pt={2}
          pb={1}
          sx={{
            flexDirection: 'column',
            textAlign: 'center',
            width: '100%'
          }}>
          <Flex
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              '> *': { flex: 1 },
              color: text
            }}>
            {Object.keys(playerInfo.availableArea).map((key) => (
              <Box key={key}>{GROWTH_STAGE_SYMBOLS[Number.parseInt(key) as GrowthStage]}</Box>
            ))}
          </Flex>
          <Flex
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              '> *': { flex: 1 }
            }}>
            {Object.entries(playerInfo.availableArea).map(([key, number]) => (
              <Box key={key} sx={{ color: number > 0 ? text : 'muted' }}>{number}</Box>
            ))}
          </Flex>
        </Flex>
        <Flex
          sx={{
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            padding: '4px',
            pb: '30px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: text,
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1,
            borderBottom: 'none',
            maxWidth: ['72px', '86px'],
            width: 'calc(100% - 8px)'
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
                {reverse(slots).map((isAvailable, i) => (
                  <Box
                    key={i}
                    sx={{
                      margin: ['1px', '2px'],
                      width: size,
                      height: size,
                      borderRadius: '100%',
                      borderColor: text,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      backgroundColor: isAvailable ? text : 'transparent'
                    }}
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

StationIndicator.propTypes = stationProps

export default StationIndicator

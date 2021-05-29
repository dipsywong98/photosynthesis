import { FunctionComponent, useMemo } from 'react'
import { Animate, HashMap, NodeGroup } from 'react-move'
import { SUN_ROTATION_DURATION, TAU } from '../3d/constants'
import { getColor } from '@theme-ui/color'
import { useThemeUI } from '@theme-ui/core'
import { Box, BoxProps } from '@theme-ui/components'
import { darken, lighten } from 'polished'
import { useGame } from '../Game/GameContext'
import easeInOut from '../Game/easing/1d/easeInOut'
import easeInOutQuart from '../Game/easing/1d/easeInOutQuart'

const getRemainingSlices = (elapsedRounds: number, circleIndex: number): number => {
  if (elapsedRounds / 6 < circleIndex) {
    return 6
  } else if (elapsedRounds / 6 >= circleIndex + 1) {
    return 0
  } else {
    return 6 - elapsedRounds % 6
  }
}

const isPieEnlarged = (elapsedRounds: number, circleIndex: number): boolean => {
  return elapsedRounds / 6 >= circleIndex
}

const getCoordinatesOnCircle = (percentageRemaining: number): { x: number, y: number } => {
  return {
    x: -Math.sin(TAU * percentageRemaining),
    y: -Math.cos(TAU * percentageRemaining)
  }
}

const BORDER_WIDTH = 0.08

const RevolutionCounter: FunctionComponent<BoxProps> = ({
  ...boxProps
}) => {
  const [game] = useGame()
  const state = game.state
  const preparingRounds = state?.preparingRound ?? 0
  const isPreparation = preparingRounds > 0
  const totalRounds = isPreparation ? 6 : (state?.totalRevolutions ?? 0) * 6
  const elapsedRounds = isPreparation ? 6 - preparingRounds : totalRounds - (state?.revolutionLeft ?? 0) * 6 + (6 - (state?.rayDirection ?? 0)) % 6

  // eslint-disable-next-line
  const circleIndexes = useMemo(() => [...Array(Math.ceil(totalRounds / 6)).keys()], [elapsedRounds, totalRounds])
  const { theme } = useThemeUI()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const bg = getColor(theme, 'bgs.2') as string
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const accent = getColor(theme, isPreparation ? 'blue.0' : 'yellow.0') as string
  const shadow = darken(0.1, bg)
  const highlight = lighten(0.1, bg)
  const { sx, ...otherBoxProps } = boxProps
  // eslint-disable-next-line
  const updateNodeGroup = (_: any, i: number): HashMap[] => [
    {
      remaining: [Math.min(0.9999, getRemainingSlices(elapsedRounds, i) / 6)],
      timing: { duration: SUN_ROTATION_DURATION * 1000, ease: easeInOut }
    },
    {
      scale: [isPieEnlarged(elapsedRounds, i) ? 1 : 0.3],
      x: [isPieEnlarged(elapsedRounds, i) ? 0 : i - Math.floor((elapsedRounds) / 6) + 0.85],
      timing: { duration: SUN_ROTATION_DURATION * 1000, ease: easeInOutQuart }
    }
  ]
  return (
    <Box
      sx={{
        text: {
          fill: 'text'
        },
        userSelect: 'none',
        ...sx
      }}
      {...otherBoxProps}>
      <svg width={250} height={80} viewBox='0 0 6 2.2' shapeRendering='crisp-edges'>
        <title>
          {`${totalRounds - elapsedRounds}${isPreparation ? ' preparation' : ''} turns remaining`}
        </title>
        <defs>
          <filter id='tintBlue'>
            <feColorMatrix type='matrix' values='0 0 1 0.1 0 0 0.5 0.9 0.1 0 0 0 0.7 0.8 0 0 0 0 1 0'/>
          </filter>
          <filter id='shadow'>
            <feDropShadow dx={0} dy={0.035} stdDeviation={0.05} floodOpacity={0.25}/>
          </filter>
          <clipPath id='frame'>
            <circle cx={0} cy={0} r={1}/>
          </clipPath>
          <g id='hexBorderBase' clipPath='url(#frame)'>
            <circle cx={0} cy={0} r={1} stroke='white' strokeWidth={BORDER_WIDTH * 2} fill='none'/>
            <circle cx={0} cy={0} r={0.5} fill='white'/>
            <g>
              <rect
                transform={`translate(${-BORDER_WIDTH / 2} 0)`}
                y={-1}
                width={BORDER_WIDTH}
                height={2}
                fill='white'
              />
            </g>
            <g transform='rotate(60)'>
              <rect
                transform={`translate(${-BORDER_WIDTH / 2} 0)`}
                y={-1}
                width={BORDER_WIDTH}
                height={2}
                fill='white'
              />
            </g>
            <g transform='rotate(120)'>
              <rect
                transform={`translate(${-BORDER_WIDTH / 2} 0)`}
                y={-1}
                width={BORDER_WIDTH}
                height={2}
                fill='white'
              />
            </g>
          </g>
          <mask id='hexBorder'>
            <use xlinkHref='#hexBorderBase'/>
          </mask>
          <radialGradient id='containerFg' cx={0.5} cy={0} r={0.8} fx={0.5} fy={0.2}>
            <stop
              style={{ stopColor: highlight, stopOpacity: 1 }}
              offset='0'
            />
            <stop
              style={{ stopColor: shadow, stopOpacity: 1 }}
              offset='1'
            />
          </radialGradient>
          <radialGradient id='containerBg' cx={0.5} cy={1} r={1} fx={0.5} fy={0.8}>
            <stop
              style={{ stopColor: highlight, stopOpacity: 1 }}
              offset='0'
            />
            <stop
              style={{ stopColor: shadow, stopOpacity: 1 }}
              offset='1'
            />
          </radialGradient>
          <linearGradient
            id='linearGradient2171'>
            <stop
              style={{ stopColor: '#fff9a9', stopOpacity: 0.37254903 }}
              offset='0'
              id='stop2165'
            />
            <stop
              style={{ stopColor: '#ffef96', stopOpacity: 0.1021999 }}
              offset='0.5'
              id='stop2167'
            />
            <stop
              style={{ stopColor: '#ffec63', stopOpacity: 0.00264023 }}
              offset='0.75'
              id='stop2173'
            />
            <stop
              style={{ stopColor: '#ffea30', stopOpacity: 0 }}
              offset='1'
              id='stop2169'
            />
          </linearGradient>
          <linearGradient
            id='linearGradient2131'>
            <stop
              style={{ stopColor: '#fffded', stopOpacity: 0.81651807 }}
              offset='0'
              id='stop2127'
            />
            <stop
              style={{ stopColor: '#fffcdf', stopOpacity: 0.53720075 }}
              offset='0.5'
              id='stop2137'
            />
            <stop
              style={{ stopColor: '#ffffff', stopOpacity: 0 }}
              offset='1'
              id='stop2129'
            />
          </linearGradient>
          <radialGradient
            href='#linearGradient1018'
            id='radialGradient1020'
            cx='77.560883'
            cy='67.446457'
            fx='77.560883'
            fy='67.446457'
            r='64.468956'
            gradientUnits='userSpaceOnUse'
            gradientTransform='matrix(0.73371669,1.2708346,-1.0409322,0.60099607,93.712059,-58.333995)'
          />
          <linearGradient
            id='linearGradient1018'>
            <stop
              style={{ stopColor: '#fff82e', stopOpacity: 1 }}
              offset='0'
              id='stop1014'
            />
            <stop
              style={{ stopColor: '#ff8600', stopOpacity: 1 }}
              offset='1'
              id='stop1016'
            />
          </linearGradient>
          <radialGradient
            href='#linearGradient1820'
            id='radialGradient1020-8'
            cx='88.773727'
            cy='63.517612'
            fx='88.773727'
            fy='63.517612'
            r='64.468956'
            gradientUnits='userSpaceOnUse'
            gradientTransform='matrix(0.44201773,0.75138827,-0.74632483,0.43904328,100.8945,-1.9339557)'
          />
          <linearGradient
            id='linearGradient1820'>
            <stop
              style={{ stopColor: '#fff4b4', stopOpacity: 0 }}
              offset='0'
              id='stop1816'
            />
            <stop
              style={{ stopColor: '#f0ba5a', stopOpacity: 0 }}
              offset='0.75'
              id='stop1822'
            />
            <stop
              style={{ stopColor: '#fff274', stopOpacity: 0.84705889 }}
              offset='1'
              id='stop1818'
            />
          </linearGradient>
          <radialGradient
            href='#linearGradient2131'
            id='radialGradient2133'
            cx='93.525307'
            cy='68.181641'
            fx='93.525307'
            fy='68.181641'
            r='44.625431'
            gradientTransform='matrix(0.98276729,0.00528918,-0.00322951,0.60285783,2.0475808,25.053584)'
            gradientUnits='userSpaceOnUse'
          />
          <radialGradient
            href='#linearGradient2171'
            id='radialGradient2133-3'
            cx='93.525307'
            cy='68.181641'
            fx='93.525307'
            fy='68.181641'
            r='44.625431'
            gradientTransform='matrix(0.61266046,0.00270719,-0.00201328,0.30856342,-104.25485,155.02083)'
            gradientUnits='userSpaceOnUse'
          />
          <g
            id='sun'
            transform='scale(0.017896362) translate(-92.862984 -92.967812)'
            filter={isPreparation ? 'url(#tintBlue)' : undefined}>
            <g
              id='layer3'>
              <circle
                fill='url(#radialGradient1020)'
                fillOpacity='1'
                id='path1012'
                cx='92.862984'
                cy='92.967812'
                r='55.877277'
              />
            </g>
            <g
              id='layer6'>
              <circle
                fill='url(#radialGradient1020-8)'
                fillOpacity='1'
                id='path1012-2'
                cx='92.862984'
                cy='92.967812'
                r='55.877277'
              />
            </g>
            <g
              id='layer7'>
              <ellipse
                fill='url(#radialGradient2133)'
                fillOpacity='1'
                id='path2125'
                cx='93.247475'
                cy='68.206581'
                rx='44.625431'
                ry='29.568932'
              />
              <ellipse
                fill='url(#radialGradient2133-3)'
                fillOpacity='1'
                id='path2125-9'
                cx='-47.400539'
                cy='177.10806'
                rx='27.819649'
                ry='15.134401'
                transform='matrix(0.68938617,-0.72439403,0.85105199,0.52508144,0,0)'
              />
            </g>
          </g>
        </defs>
        <g transform='translate(1 1.05)'>
          <circle cx={0} cy={0} r={1} fill='url(#containerBg)'/>
          <NodeGroup
            data={circleIndexes}
            keyAccessor={(x: number) => x.toString()}
            start={(_, i) => ({
              remaining: Math.min(0.9999, getRemainingSlices(elapsedRounds, i) / 6),
              scale: 0,
              x: isPieEnlarged(elapsedRounds, i) ? 0 : i - Math.floor((elapsedRounds) / 6) + 0.85
            })}
            update={updateNodeGroup}
            enter={updateNodeGroup}
            leave={() => ({
              scale: 0,
              timing: { duration: SUN_ROTATION_DURATION * 1000, ease: easeInOutQuart }
            })}>
            {nodes => (
              <g>
                {nodes.map(({ key, state: { remaining, scale, x } }: { key: string, state: { remaining: number, scale: number, x: number } }) => {
                  const isLargeArc = remaining >= 0.5 ? 1 : 0
                  const { x: arcX, y: arcY } = getCoordinatesOnCircle(remaining)
                  const maskId = `mask-${key}`
                  return (
                    <g key={key} transform={`translate(${x} 0) scale(${scale})`}>
                      <defs>
                        <clipPath id={maskId}>
                          <path
                            d={`M 0 -1 A 1 1 0 ${isLargeArc} 0 ${arcX.toString()} ${arcY.toString()} L 0 0 Z`}
                          />
                        </clipPath>
                      </defs>
                      <g clipPath={`url(#${maskId})`}>
                        <use href='#sun'/>
                      </g>
                    </g>
                  )
                })}
              </g>
            )}
          </NodeGroup>
          <Animate
            start={{
              rotation: elapsedRounds * 60
            }}
            update={{
              rotation: [elapsedRounds * 60],
              timing: { duration: 2000, ease: easeInOut }
            }}>
            {({ rotation }) => {
              return (
                <path
                  d='M 0 -1 A 1 1 0 0 0 -0.8660254037844386 -0.5000000000000001 L 0 0 Z'
                  fill={accent}
                  transform={`rotate(${60 + (rotation as number)})`}
                />
              )
            }}
          </Animate>
          <use xlinkHref='#hexBorderBase' filter='url(#shadow)'/>
          <g mask='url(#hexBorder)'>
            <circle cx={0} cy={0} r={1} fill='url(#containerFg)'/>
          </g>
          <text fontSize={0.6} textAnchor='middle' dy={0.2}>
            {totalRounds - elapsedRounds}
          </text>
        </g>
      </svg>
    </Box>
  )
}

export default RevolutionCounter

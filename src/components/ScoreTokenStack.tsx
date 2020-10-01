import React, { FunctionComponent } from 'react'
import PropTypes, { InferProps } from 'prop-types'
import token1 from '../assets/images/tokens/token1.png'
import token2 from '../assets/images/tokens/token2.png'
import token3 from '../assets/images/tokens/token3.png'
import token4 from '../assets/images/tokens/token4.png'
import { ImageStack } from './common/ImageStack'

const tokenImages = ['', token1, token2, token3, token4]

const propTypes = {
  stack: PropTypes.arrayOf(PropTypes.number).isRequired,
  leaves: PropTypes.number.isRequired
}

export const ScoreTokenStack: FunctionComponent<InferProps<typeof propTypes>> = ({ stack, leaves }) => {
  const tokenImage = tokenImages[leaves]
  return (
    <ImageStack stack={stack} imgPath={tokenImage} badge={stack.length}/>
  )
}

ScoreTokenStack.propTypes = propTypes

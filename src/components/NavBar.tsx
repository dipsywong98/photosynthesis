import { mdiCircleSlice4 } from '@mdi/js'
import { Flex, useColorMode } from 'theme-ui'

import theme from '../theme'
import Button from './common/Button'
import Icon from './common/Icon'
import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  setState: PropTypes.func.isRequired,
  state: PropTypes.number.isRequired
}

const NavBar: FunctionComponent<PropTypes.InferProps<typeof propTypes>> = () => {
  const [colorMode, setColorMode] = useColorMode()
  const toggleDarkMode = (): void => setColorMode(colorMode === 'default' ? 'dark' : 'default')

  return (
    <Flex
      py={2}
      // eslint-disable-next-line
      // @ts-ignore
      // eslint-disable-next-line
      px={theme.layout?.container.p}
      sx={{ alignItems: 'center', position: 'fixed', width: '100%', zIndex: 1 }}>
      <Flex mr={2} sx={{ alignItems: 'center', flex: 1 }}>
        {/* {state > 0 && <Button onClick={() => setState(state - 1)}><Icon path={mdiArrowLeft}/></Button>} */}
      </Flex>
      <Flex ml='auto' sx={{ alignItems: 'center' }}>
        <Button onClick={toggleDarkMode} mr={2} title='Toggle Dark Mode'><Icon path={mdiCircleSlice4}/></Button>
      </Flex>
    </Flex>
  )
}
export default NavBar

NavBar.propTypes = propTypes

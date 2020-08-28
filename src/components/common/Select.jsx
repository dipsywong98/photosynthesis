/** @jsx jsx */
import { jsx } from 'theme-ui'
import { Box, Label, Text } from '@theme-ui/components'
import PropTypes from 'prop-types'
import { useState } from 'react'
import BasicSelect from './BasicSelect'

const Select = props => {
  const [isOpen, setOpen] = useState(false)

  return (
    <Box mt={3} sx={{ width: props.fullwidth ? '100%' : undefined }}>
      <Label
        sx={{
          position: 'relative',
          display: 'inline-box',
          width: props.fullwidth ? '100%' : undefined
        }}
        onClick={e => e.preventDefault()}>
        <BasicSelect
          onToggle={setOpen}
          {...props}
          __themeKey='inputs'
          variant='baseMagic'
          value={props.value}
        />
        <Text
          sx={{
            ml: -1,
            color: isOpen ? 'blue' : null
          }}>{props.label}</Text>
      </Label>
      <Text variant='helperText'>
        {props.helperText}
      </Text>
    </Box>
  )
}

Select.propTypes = {
  label: PropTypes.string.isRequired,
  ...BasicSelect.propTypes
}

export default Select

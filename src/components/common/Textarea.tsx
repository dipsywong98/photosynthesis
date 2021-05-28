import { Box, Label, Text } from '@theme-ui/components'
import { FC } from 'react'
import BasicTextarea from './BasicTextarea'
import { SxProp } from '@theme-ui/core'

interface TextareaProps extends SxProp {
  fullwidth?: boolean
  label: string
  name?: string
  value?: string
  helperText?: string
}

const Textarea: FC<TextareaProps> = props => (
  <Box mt={3} sx={{ width: props.fullwidth ?? false ? '100%' : undefined, ...props.sx }}>
    <Label
      sx={{
        position: 'relative'
      }}>
      <BasicTextarea
        {...props}
        placeholder={props.label}
        variant='inputMagic'
        sx={{ width: props.fullwidth ?? false ? '100%' : undefined, ...props.sx }}
      />
      <Text>{props.label}</Text>
    </Label>
    <Text variant='helperText'>
      {props.helperText}
    </Text>
  </Box>
)

export default Textarea

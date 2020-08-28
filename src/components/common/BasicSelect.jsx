import React from 'react'
import PropTypes from 'prop-types'
import Dropdown from './Dropdown'
import MenuItem from './MenuItem'

const BasicSelect = (props) => {
  const { onSelect } = props
  const choices = Array.isArray(props.choices)
    ? props.choices
    : Object.entries(props.choices).map(([value, label]) => ({
      value,
      label,
      ...label
    }))
  const optionToValue = props.optionToValue ?? (option => props.valueKey ? option[props.valueKey] : option.value || option)
  const optionToString = props.optionToString ?? (option => props.formatKey ? option[props.formatKey] : option.label || option)
  const selected = props.value
    ? choices.find(choice => props.value === optionToValue(choice)) ?? props.value
    : choices[0]

  const handleSelect = (choice, e) => {
    e.stopPropagation()
    const value = optionToValue(choice)
    onSelect && onSelect(value)
  }

  return (
    <Dropdown {...props} title={optionToString(selected)}>
      {choices.map(choice => (
        <MenuItem
          key={optionToValue(choice)}
          onClick={e => handleSelect(choice, e)}>
          {optionToString(choice)}
        </MenuItem>
      ))
      }
    </Dropdown>
  )
}

BasicSelect.propTypes = {
  choices: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]).isRequired,
  onSelect: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fullwidth: PropTypes.bool,
  valueKey: PropTypes.string,
  formatKey: PropTypes.string,
  optionToString: PropTypes.func,
  optionToValue: PropTypes.func
}

export default BasicSelect

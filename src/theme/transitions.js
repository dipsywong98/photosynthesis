export const SLOW = 0.3
export const FAST = 0.1

export const transition = (time, props, ease = 'ease') => ({
  transition: props.map(p => `${time}s ${p} ${ease}`).join(',')
})

export const shortTransition = (props) => transition(FAST, props)

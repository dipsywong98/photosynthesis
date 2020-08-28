const pageHeadingSizes = [4, 5, 6]
const pageHeadingIconSizes = pageHeadingSizes.map(x => theme => theme.fontSizes[x])

export default {
  fontSize: 1,
  success: {
    color: 'green.1'
  },
  danger: {
    color: 'red.1'
  },
  warning: {
    color: 'yellow.1'
  },
  heading: {
    fontSize: [3, 4],
    mb: 3
  },
  subheading: {
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: 'bold',
    fontSize: 2,
    color: 'fgPales.0',
    mb: 3
  },
  pageHeading: {
    fontSize: pageHeadingSizes,
    mb: 3,
    svg: {
      color: '#ff0000',
      width: pageHeadingIconSizes,
      height: pageHeadingIconSizes
    }
  },
  largeHeading: {
    fontSize: [5, null, 7],
    mb: 3
  },
  columnHeading: {
    fontSize: 2,
    fontWeight: 'bold'
  },
  columnCardHeading: {
    fontSize: 2,
    fontWeight: 'bold'
  },
  helperText: {
    fontSize: 0,
    color: 'muted'
  }
}

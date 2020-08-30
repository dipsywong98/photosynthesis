export const pause = (timeout: number) => new Promise(resolve => {
  setTimeout(() => {
    resolve()
  }, timeout)
})

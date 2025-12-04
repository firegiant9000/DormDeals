export const isDebug = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')
export const dlog = (...args: any[]) => { if (isDebug()) console.log(...args) }


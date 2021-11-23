import { option } from 'fp-ts'
import { Reader } from 'fp-ts/Reader'
import { Option } from 'fp-ts/Option'
import { useRef } from 'react'
import { constVoid, pipe } from 'fp-ts/function'

export function useDebounce<T>(
  action: Reader<T, void>,
  delay: number,
): Reader<T, void> {
  const timeout = useRef<Option<number>>(option.none)

  return (input: T) => {
    pipe(
      timeout.current,
      option.fold(constVoid, timeout => window.clearTimeout(timeout)),
    )

    timeout.current = option.some(
      window.setTimeout(() => {
        action(input)
        timeout.current = option.none
      }, delay),
    )
  }
}

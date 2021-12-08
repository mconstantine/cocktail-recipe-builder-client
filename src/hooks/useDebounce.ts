import { option } from 'fp-ts'
import { Reader } from 'fp-ts/Reader'
import { Option } from 'fp-ts/Option'
import { useRef, useState } from 'react'
import { constVoid, pipe } from 'fp-ts/function'

export function useDebounce<T>(
  action: Reader<T, void>,
  delay: number,
): [debounced: Reader<T, void>, isWaiting: boolean] {
  const timeout = useRef<Option<number>>(option.none)
  const [isWaiting, setIsWaiting] = useState(false)

  const debounced = (input: T) => {
    pipe(
      timeout.current,
      option.fold(constVoid, timeout => window.clearTimeout(timeout)),
    )

    setIsWaiting(true)

    timeout.current = option.some(
      window.setTimeout(() => {
        setIsWaiting(false)
        action(input)
        timeout.current = option.none
      }, delay),
    )
  }

  return [debounced, isWaiting]
}

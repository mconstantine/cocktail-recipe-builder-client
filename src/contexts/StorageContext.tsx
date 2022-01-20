import { option } from 'fp-ts'
import { constVoid, pipe } from 'fp-ts/function'
import { Option } from 'fp-ts/Option'
import * as t from 'io-ts'
import { NonEmptyString } from 'io-ts-types'
import { createContext, PropsWithChildren, useContext } from 'react'

const StorageMap = t.type(
  {
    loginToken: NonEmptyString,
  },
  'StorageMap',
)
type StorageMap = t.TypeOf<typeof StorageMap>

interface StorageContext {
  getStorageValue: <K extends keyof StorageMap>(
    input: K,
  ) => Option<StorageMap[K]>
  setStorageValue: <K extends keyof StorageMap>(
    input: K,
    value: StorageMap[K],
  ) => void
}

const StorageContext = createContext<StorageContext>({
  getStorageValue: () => option.none,
  setStorageValue: constVoid,
})

export function useStorage() {
  return useContext(StorageContext)
}

export function StorageProvider(props: PropsWithChildren<{}>) {
  const setStorageValue = function set<K extends keyof StorageMap>(
    input: K,
    value: StorageMap[K],
  ): void {
    window.localStorage.setItem(input, JSON.stringify(value))
  }

  const getStorageValue = function get<K extends keyof StorageMap>(
    input: K,
  ): Option<StorageMap[K]> {
    return pipe(
      window.localStorage.getItem(input),
      option.fromNullable,
      option.chain(value => option.tryCatch(() => JSON.parse(value))),
    )
  }

  return (
    <StorageContext.Provider value={{ getStorageValue, setStorageValue }}>
      {props.children}
    </StorageContext.Provider>
  )
}

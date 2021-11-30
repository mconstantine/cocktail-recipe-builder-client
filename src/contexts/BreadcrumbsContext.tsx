import { Breadcrumbs, Link as MUILink, Typography } from '@mui/material'
import { option } from 'fp-ts'
import { constVoid, pipe } from 'fp-ts/function'
import { IO } from 'fp-ts/IO'
import { Option } from 'fp-ts/Option'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Link } from '../components/Link'

interface Breadcrumb {
  label: string
  path: Option<string>
}

interface BreadcrumbsContext {
  breadcrumbs: Breadcrumb[]
  setBreadcrumbs: Dispatch<SetStateAction<Breadcrumb[]>>
}

const BreadcrumbsContext = createContext<BreadcrumbsContext>({
  breadcrumbs: [],
  setBreadcrumbs: constVoid,
})

export function BreadcrumbsProvider(props: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

  return (
    <BreadcrumbsContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {props.children}
    </BreadcrumbsContext.Provider>
  )
}

export function useSetBreadcrumbs(breadcrumbs: Breadcrumb[]) {
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)

  useEffect(() => {
    setBreadcrumbs(breadcrumbs)
    return () => setBreadcrumbs([])
  }, [breadcrumbs, setBreadcrumbs])
}

export function useRenderBreadcrumbs(): IO<Option<NonNullable<ReactNode>>> {
  const { breadcrumbs } = useContext(BreadcrumbsContext)

  return () =>
    breadcrumbs.length
      ? option.some(
          <Breadcrumbs
            aria-label="breadcrumb"
            color="inherit"
            sx={{ flexGrow: 1 }}
          >
            {breadcrumbs.map(({ label, path }, index) =>
              pipe(
                path,
                option.fold(
                  () => <Typography key={index}>{label}</Typography>,
                  path => (
                    <MUILink key={index} href={path} component={Link}>
                      {label}
                    </MUILink>
                  ),
                ),
              ),
            )}
          </Breadcrumbs>,
        )
      : option.none
}

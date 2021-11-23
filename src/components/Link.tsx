import { PropsWithChildren } from 'react'
import { Link as RouterLink } from 'react-router-dom'

interface Props {
  href: string
  style?: React.CSSProperties
}

export function Link(props: PropsWithChildren<Props>) {
  return (
    <RouterLink className="Link" to={props.href} style={props.style}>
      {props.children}
    </RouterLink>
  )
}

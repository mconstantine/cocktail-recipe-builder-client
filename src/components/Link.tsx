import { forwardRef, PropsWithChildren } from 'react'
import { Link as RouterLink } from 'react-router-dom'

interface Props {
  href: string
  style?: React.CSSProperties
}

export const Link = forwardRef<HTMLAnchorElement, PropsWithChildren<Props>>(
  (props, ref) => {
    return (
      <RouterLink
        className="Link"
        to={props.href}
        style={props.style}
        ref={ref}
      >
        {props.children}
      </RouterLink>
    )
  },
)

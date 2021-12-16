import { Box, Tab, Tabs } from '@mui/material'
import { boolean } from 'fp-ts'
import { constNull, pipe } from 'fp-ts/function'
import { ReactNode, SyntheticEvent, useState } from 'react'

interface Props<K extends string> {
  content: Record<K, ReactNode>
}

export function TabBar<K extends string>(props: Props<K>) {
  const [currentTab, setCurrentTab] = useState<K>(
    Object.keys(props.content)[0] as K,
  )

  const onTabChange = (_: SyntheticEvent, value: K) => setCurrentTab(value)

  return (
    <>
      <Tabs value={currentTab} onChange={onTabChange}>
        {Object.keys(props.content).map(key => (
          <Tab key={key} label={key} value={key} />
        ))}
      </Tabs>
      {Object.entries(props.content).map(([key, children]) => (
        <TabPanel key={key} selectedTabValue={currentTab} value={key}>
          {children as ReactNode}
        </TabPanel>
      ))}
    </>
  )
}

interface TabPanelProps<K extends string> {
  children?: ReactNode
  selectedTabValue: K
  value: K
}

function TabPanel<K extends string>(props: TabPanelProps<K>) {
  const isSelectedTab = props.value === props.selectedTabValue

  return (
    <div
      role="tabpanel"
      hidden={!isSelectedTab}
      aria-labelledby={props.selectedTabValue}
    >
      <Box sx={{ mt: 6 }}>
        {pipe(
          isSelectedTab,
          boolean.fold(constNull, () => props.children),
        )}
      </Box>
    </div>
  )
}

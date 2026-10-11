import {
  SettingsChoiceList,
  type SettingsChoiceOption,
} from '@/features/settings/SettingsChoiceList/SettingsChoiceList'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import styles from './SettingsChoiceScreen.module.css'

export interface SettingsChoiceScreenProps<T extends string> {
  title: string
  options: SettingsChoiceOption<T>[]
  selectedValue: T
  onSelect: (value: T) => void
  layout?: 'list' | 'grid'
}

export function SettingsChoiceScreen<T extends string>({
  title,
  options,
  selectedValue,
  onSelect,
  layout,
}: SettingsChoiceScreenProps<T>) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <main className={styles.page}>
      <h1 ref={headingRef} className={styles.title} tabIndex={-1}>
        {title}
      </h1>
      <SettingsChoiceList
        label={title}
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
        layout={layout}
      />
    </main>
  )
}

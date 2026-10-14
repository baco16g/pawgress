import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import { TEXT_SIZE_LABEL, type TextSizePreference } from '@/domain/settings/settings'
import { useShowNavOnMount } from '@/app/state/navVisibilityContext'

const OPTIONS: TextSizePreference[] = ['standard', 'large', 'extraLarge']

export function SettingsTextSizeRoute() {
  useShowNavOnMount()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<TextSizePreference>
      title="文字サイズ"
      selectedValue={settings.textSize}
      options={OPTIONS.map((value) => ({ value, label: TEXT_SIZE_LABEL[value] }))}
      onSelect={(value) => {
        updateSettings({ textSize: value })
        void navigate('/settings')
      }}
    />
  )
}

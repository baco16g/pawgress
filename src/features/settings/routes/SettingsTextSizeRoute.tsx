import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import {
  TEXT_SIZE_LABEL,
  TEXT_SIZE_OPTIONS,
  type TextSizePreference,
} from '@/domain/settings/settings'

export function SettingsTextSizeRoute() {
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<TextSizePreference>
      title="文字サイズ"
      selectedValue={settings.textSize}
      options={TEXT_SIZE_OPTIONS.map((value) => ({ value, label: TEXT_SIZE_LABEL[value] }))}
      onSelect={(value) => {
        updateSettings({ textSize: value })
        void navigate('/settings')
      }}
    />
  )
}

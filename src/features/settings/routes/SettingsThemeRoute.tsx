import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import { THEME_LABEL, THEME_OPTIONS, type ThemePreference } from '@/domain/settings/settings'

export function SettingsThemeRoute() {
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<ThemePreference>
      title="テーマ"
      selectedValue={settings.theme}
      options={THEME_OPTIONS.map((value) => ({ value, label: THEME_LABEL[value] }))}
      onSelect={(value) => {
        updateSettings({ theme: value })
        void navigate('/settings')
      }}
    />
  )
}

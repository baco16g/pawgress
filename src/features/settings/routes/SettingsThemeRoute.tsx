import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import { THEME_LABEL, type ThemePreference } from '@/domain/settings/settings'
import { useShowNavOnMount } from '@/app/state/navVisibilityContext'

const OPTIONS: ThemePreference[] = ['system', 'light', 'dark']

export function SettingsThemeRoute() {
  useShowNavOnMount()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<ThemePreference>
      title="テーマ"
      selectedValue={settings.theme}
      options={OPTIONS.map((value) => ({ value, label: THEME_LABEL[value] }))}
      onSelect={(value) => {
        updateSettings({ theme: value })
        void navigate('/settings')
      }}
    />
  )
}

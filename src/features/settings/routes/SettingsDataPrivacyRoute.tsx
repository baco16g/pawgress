import { useSettings } from '@/app/state/settingsContext'
import { SettingsDataPrivacyScreen } from '@/features/settings/SettingsDataPrivacyScreen/SettingsDataPrivacyScreen'

export function SettingsDataPrivacyRoute() {
  const { resetSettings } = useSettings()

  return <SettingsDataPrivacyScreen onResetSettings={resetSettings} />
}

import { useSettings } from '@/app/state/settingsContext'
import { SettingsDataPrivacyScreen } from '@/features/settings/SettingsDataPrivacyScreen/SettingsDataPrivacyScreen'
import { useShowNavOnMount } from '@/app/router/navVisibilityContext'

export function SettingsDataPrivacyRoute() {
  useShowNavOnMount()
  const { resetSettings } = useSettings()

  return <SettingsDataPrivacyScreen onResetSettings={resetSettings} />
}

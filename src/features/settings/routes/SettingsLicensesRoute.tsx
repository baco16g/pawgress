import { SettingsLicensesScreen } from '@/features/settings/SettingsLicensesScreen/SettingsLicensesScreen'
import { useShowNavOnMount } from '@/app/state/navVisibilityContext'

export function SettingsLicensesRoute() {
  useShowNavOnMount()

  return <SettingsLicensesScreen />
}

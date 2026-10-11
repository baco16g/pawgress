import { SettingsLicensesScreen } from '@/features/settings/SettingsLicensesScreen/SettingsLicensesScreen'
import { useShowNavOnMount } from '@/app/router/navVisibilityContext'

export function SettingsLicensesRoute() {
  useShowNavOnMount()

  return <SettingsLicensesScreen />
}

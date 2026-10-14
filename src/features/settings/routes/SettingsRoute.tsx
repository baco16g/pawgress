import { useSettings } from '@/app/state/settingsContext'
import { SettingsScreen } from '@/features/settings/SettingsScreen/SettingsScreen'
import {
  COMPANION_SPECIES_LABEL,
  MOTION_LABEL,
  TEXT_SIZE_LABEL,
  THEME_LABEL,
} from '@/domain/settings/settings'

export function SettingsRoute() {
  const { settings } = useSettings()

  return (
    <SettingsScreen
      textSizeValueLabel={TEXT_SIZE_LABEL[settings.textSize]}
      themeValueLabel={THEME_LABEL[settings.theme]}
      motionValueLabel={MOTION_LABEL[settings.motion]}
      companionValueLabel={COMPANION_SPECIES_LABEL[settings.companionSpecies]}
      maxTodayTasksValueLabel={`${String(settings.maxTodayTasks)}件`}
    />
  )
}

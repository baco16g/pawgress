import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import { MOTION_LABEL, type MotionPreference } from '@/domain/settings/settings'
import { useShowNavOnMount } from '@/app/state/navVisibilityContext'

const OPTIONS: MotionPreference[] = ['system', 'reduced']

export function SettingsMotionRoute() {
  useShowNavOnMount()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<MotionPreference>
      title="アニメーション"
      selectedValue={settings.motion}
      options={OPTIONS.map((value) => ({ value, label: MOTION_LABEL[value] }))}
      onSelect={(value) => {
        updateSettings({ motion: value })
        void navigate('/settings')
      }}
    />
  )
}

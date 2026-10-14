import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import { MOTION_LABEL, MOTION_OPTIONS, type MotionPreference } from '@/domain/settings/settings'

export function SettingsMotionRoute() {
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<MotionPreference>
      title="アニメーション"
      selectedValue={settings.motion}
      options={MOTION_OPTIONS.map((value) => ({ value, label: MOTION_LABEL[value] }))}
      onSelect={(value) => {
        updateSettings({ motion: value })
        void navigate('/settings')
      }}
    />
  )
}

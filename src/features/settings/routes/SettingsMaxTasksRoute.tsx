import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import { MAX_TODAY_TASKS_OPTIONS } from '@/domain/settings/settings'
import { useShowNavOnMount } from '@/app/router/navVisibilityContext'

export function SettingsMaxTasksRoute() {
  useShowNavOnMount()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<string>
      title="1日の最大タスク量"
      selectedValue={String(settings.maxTodayTasks)}
      options={MAX_TODAY_TASKS_OPTIONS.map((value) => ({
        value: String(value),
        label: `${String(value)}件`,
      }))}
      onSelect={(value) => {
        updateSettings({ maxTodayTasks: Number(value) })
        void navigate('/settings')
      }}
    />
  )
}

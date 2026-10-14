import { useNavigate } from 'react-router'
import { useSettings } from '@/app/state/settingsContext'
import { REPRESENTATIVE_VARIANT } from '@/features/companion/model/companionAssets'
import { Companion } from '@/features/companion/ui/Companion/Companion'
import { SettingsChoiceScreen } from '@/features/settings/SettingsChoiceScreen/SettingsChoiceScreen'
import {
  COMPANION_SPECIES_LABEL,
  type CompanionSpeciesPreference,
} from '@/domain/settings/settings'

const OPTIONS: CompanionSpeciesPreference[] = ['dog', 'cat']

export function SettingsCompanionRoute() {
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <SettingsChoiceScreen<CompanionSpeciesPreference>
      title="相棒"
      selectedValue={settings.companionSpecies}
      layout="grid"
      options={OPTIONS.map((value) => ({
        value,
        label: COMPANION_SPECIES_LABEL[value],
        icon: (
          <span aria-hidden="true">
            <Companion
              species={value}
              variant={REPRESENTATIVE_VARIANT[value]}
              state="idle"
              size={150}
              framed={false}
            />
          </span>
        ),
      }))}
      onSelect={(value) => {
        updateSettings({ companionSpecies: value })
        void navigate('/settings')
      }}
    />
  )
}

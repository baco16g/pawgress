import { ExternalLink } from 'lucide-react'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import licenses from './licenses.generated.json'
import styles from './SettingsLicensesScreen.module.css'

interface LicenseEntry {
  name: string
  version: string | null
  license: string
  note: string
  href: string
  sourceHref?: string
}

function LicenseList({ entries }: { entries: LicenseEntry[] }) {
  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <li key={entry.name} className={styles.item}>
          <a
            className={styles.row}
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${entry.name}のライセンスを見る（新しいタブで開きます）`}
          >
            <span className={styles.rowText} aria-hidden="true">
              <span className={styles.name}>
                {entry.name}
                {entry.version === null ? null : (
                  <span className={styles.version}> v{entry.version}</span>
                )}
              </span>
              <span className={styles.meta}>
                {entry.license} ・ {entry.note}
              </span>
            </span>
            <ExternalLink aria-hidden="true" className={styles.externalIcon} size={16} />
          </a>
          {entry.sourceHref ? (
            <a
              className={styles.sourceLink}
              href={entry.sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${entry.name}の配布元を見る（新しいタブで開きます）`}
            >
              配布元を見る
              <ExternalLink aria-hidden="true" size={12} />
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function SettingsLicensesScreen() {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <main className={styles.page}>
      <h1 ref={headingRef} className={styles.title} tabIndex={-1}>
        ライセンス・クレジット
      </h1>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>ソフトウェア</h2>
        <LicenseList entries={licenses.software} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>相棒の素材</h2>
        <LicenseList entries={licenses.assets} />
        <p className={styles.footnote}>
          両パックとも CC0（Creative Commons
          Zero）で提供されており、作者名などの追加クレジット表記は求められていません。ただし、確認できるライセンス原文へのリンクは掲載しています。
        </p>
      </section>
    </main>
  )
}

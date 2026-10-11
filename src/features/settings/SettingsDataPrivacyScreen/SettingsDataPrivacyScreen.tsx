import { Button } from '@/shared/ui/Button/Button'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import styles from './SettingsDataPrivacyScreen.module.css'

export interface SettingsDataPrivacyScreenProps {
  onResetSettings: () => void
}

export function SettingsDataPrivacyScreen({ onResetSettings }: SettingsDataPrivacyScreenProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <main className={styles.page}>
      <h1 ref={headingRef} className={styles.title} tabIndex={-1}>
        データとプライバシー
      </h1>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>今日のタスク・Inbox・記録</h2>
        <p className={styles.text}>
          タスク、Inbox、記録（History）のデータは、この端末のブラウザに保存され、次回起動時も引き継がれます。外部サーバーへの送信や保存は行っていません。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>設定</h2>
        <p className={styles.text}>
          文字サイズ・テーマ・アニメーション・相棒・1日の最大タスク量などの設定は、この端末のブラウザに保存され、次回起動時も引き継がれます。他の端末とは共有されません。
        </p>
        <Button variant="tertiary" className={styles.resetButton} onClick={onResetSettings}>
          設定を初期値に戻す
        </Button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>通信</h2>
        <p className={styles.text}>
          Pawgressにはアカウント登録やサーバーとの通信を行う機能がなく、すべての処理は端末内で完結します。
        </p>
      </section>
    </main>
  )
}

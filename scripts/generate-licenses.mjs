// SettingsLicensesScreenが表示するライセンス一覧を、実際にインストールされている
// node_modulesの内容から機械的に生成する。name/version/license/repositoryを
// ハードコードせず、依存関係が変わるたびに再実行すれば自動的に追従する。
//
// 自動検出できないものだけ、このファイル内で明示的に補う:
// - Workbox: package.jsonのdependenciesには無く、vite-plugin-pwa（devDependency）
//   経由で生成されるservice workerとしてbundleへ同梱されるため、production treeの
//   走査では見つからない。node_modules内のworkbox-windowから直接読む。
// - Companion asset（CC0 pack）: npm packageではないため、そもそも検出対象外。
//   NOTICE.md記載の事実（パック名・CC0・ライセンス原文の場所）のみを転記する。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { init as initLicenseChecker } from 'license-checker-rseidelsohn'

const rootDir = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const outputPath = path.join(
  rootDir,
  'src/features/settings/SettingsLicensesScreen/licenses.generated.json',
)

// package.json "dependencies"（production実行時にimportされるもの）に実在する
// package名のみを対象にする。devDependencies由来のnoise（ビルドツール等）を含めない。
const PRODUCTION_PACKAGE_NAMES = new Set(
  Object.keys(JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf-8')).dependencies),
)

// package名 → 画面に表示する用途説明。ライセンス情報からは導出できない編集判断のため、
// ここだけは人手で書く（事実の捏造ではなく、短い説明文）。
const PURPOSE_NOTES = {
  react: 'UIライブラリ',
  'react-dom': 'UIライブラリ',
  'react-router': 'ルーティング',
  clsx: 'クラス名の結合',
  'lucide-react': 'アイコン',
}

// 表示をグループ化するための代表名。react/react-domは1行にまとめる。
const DISPLAY_NAME_OVERRIDES = {
  react: 'React / React DOM',
  'react-dom': 'React / React DOM',
  'react-router': 'React Router',
}

function cleanRepositoryUrl(url) {
  if (!url) return null
  return url
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/\.git$/, '')
}

function readWorkboxEntry() {
  const pkg = JSON.parse(
    readFileSync(path.join(rootDir, 'node_modules/workbox-window/package.json'), 'utf-8'),
  )
  return {
    name: 'Workbox',
    version: pkg.version,
    license: pkg.license,
    note: 'オフライン対応（Service Worker）',
    href: cleanRepositoryUrl(pkg.repository?.url ?? pkg.repository),
  }
}

function getCompanionAssetEntries() {
  // NOTICE.md（src/features/companion/assets/NOTICE.md）記載の事実のみ。
  // hrefはライセンス原文へのpublicなリンク（public/licenses/、
  // SettingsLicensesScreen側で参照）。sourceHrefは配布元ページ。
  return [
    {
      name: 'Pet Dogs Pack',
      version: null,
      license: 'CC0',
      note: '相棒（犬）のドット絵素材',
      href: 'licenses/pet-dogs-pack-LICENSE.txt',
      sourceHref: 'https://luizmelo.itch.io/pet-dogs-pack',
    },
    {
      name: 'Pet Cats Pack',
      version: null,
      license: 'CC0',
      note: '相棒（猫）のドット絵素材',
      href: 'licenses/pet-cats-pack-LICENSE.txt',
      sourceHref: 'https://luizmelo.itch.io/pet-cat-pack',
    },
  ]
}

initLicenseChecker(
  { start: rootDir, production: true, excludePrivatePackages: true },
  (err, packages) => {
    if (err) {
      console.error('[generate-licenses] license-checker failed:', err)
      process.exitCode = 1
      return
    }

    const softwareByName = new Map()
    for (const [key, info] of Object.entries(packages)) {
      const atIndex = key.lastIndexOf('@')
      const name = key.slice(0, atIndex)
      const version = key.slice(atIndex + 1)
      if (!PRODUCTION_PACKAGE_NAMES.has(name)) continue

      const displayName = DISPLAY_NAME_OVERRIDES[name] ?? name
      // react/react-domは同一license/repositoryのはずなので、先に見つかった方を使う。
      if (softwareByName.has(displayName)) continue

      const licenses = Array.isArray(info.licenses) ? info.licenses.join(' / ') : info.licenses
      softwareByName.set(displayName, {
        name: displayName,
        version,
        license: licenses,
        note: PURPOSE_NOTES[name] ?? '',
        href: cleanRepositoryUrl(info.repository),
      })
    }

    const software = [...softwareByName.values()]
    software.push(readWorkboxEntry())

    const result = {
      generatedAt: new Date().toISOString(),
      software,
      assets: getCompanionAssetEntries(),
    }

    mkdirSync(path.dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n')
    console.log(`[generate-licenses] wrote ${path.relative(rootDir, outputPath)}`)
  },
)

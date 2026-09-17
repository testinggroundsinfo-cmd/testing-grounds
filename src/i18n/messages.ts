import type { Locale } from "@/i18n/config";

type Messages = Record<string, string>;

const italian: Messages = {
  "nav.dashboard": "Dashboard / Il mio profilo",
  "nav.logout": "Esci",
  "nav.login": "Accedi",
  "nav.register": "Registrati",
  "nav.openMenu": "Apri menu",
  "nav.closeMenu": "Chiudi menu",
  "footer.transparency": "Testing-Grounds è gratuita. I banner sostengono i creatori del sito per garantire l'hosting, il mantenimento e il continuo sviluppo della piattaforma.",
  "home.title": "Beta testing e playtest per giochi indie e software.",
  "home.description": "Scopri build in Alpha, Closed Beta e Playtest. Lascia bug report strutturati, recensioni e candidati come collaboratore.",
  "home.gaming": "Esplora Gaming",
  "home.software": "Esplora App",
  "project.translate": "Traduci scheda progetto",
  "project.showOriginal": "Mostra testo originale",
  "project.translating": "Traduzione in corso...",
  "project.translationError": "Impossibile tradurre la scheda progetto. Riprova più tardi.",
  "project.translated": "Tradotto automaticamente",
  "project.back": "Torna ai progetti",
  "project.description": "Descrizione",
};

const translations: Record<Locale, Messages> = {
  it: italian,
  en: {
    ...italian, "nav.dashboard": "Dashboard / My profile", "nav.logout": "Log out", "nav.login": "Log in", "nav.register": "Sign up", "nav.openMenu": "Open menu", "nav.closeMenu": "Close menu",
    "footer.transparency": "Testing-Grounds is free. Banners support the site creators, helping ensure the hosting, maintenance and continuous development of the platform.",
    "home.title": "Beta testing and playtesting for indie games and software.", "home.description": "Discover Alpha, Closed Beta and Playtest builds. Submit structured bug reports, reviews and apply as a collaborator.", "home.gaming": "Explore Gaming", "home.software": "Explore Apps",
    "project.translate": "Translate project page", "project.showOriginal": "Show original text", "project.translating": "Translating...", "project.translationError": "The project page could not be translated. Please try again later.", "project.translated": "Automatically translated", "project.back": "Back to projects", "project.description": "Description",
  },
  es: {
    ...italian, "nav.dashboard": "Panel / Mi perfil", "nav.logout": "Salir", "nav.login": "Iniciar sesión", "nav.register": "Registrarse", "nav.openMenu": "Abrir menú", "nav.closeMenu": "Cerrar menú",
    "footer.transparency": "Testing-Grounds es gratis. Los banners apoyan a los creadores del sitio y garantizan el alojamiento, mantenimiento y desarrollo continuo de la plataforma.",
    "home.title": "Beta testing y playtesting para juegos indie y software.", "home.description": "Descubre versiones Alpha, Closed Beta y Playtest. Envía informes de errores, reseñas y solicitudes de colaboración.", "home.gaming": "Explorar Gaming", "home.software": "Explorar Apps",
    "project.translate": "Traducir ficha del proyecto", "project.showOriginal": "Mostrar texto original", "project.translating": "Traduciendo...", "project.translationError": "No se pudo traducir la ficha del proyecto. Inténtalo más tarde.", "project.translated": "Traducido automáticamente", "project.back": "Volver a proyectos", "project.description": "Descripción",
  },
  fr: {
    ...italian, "nav.dashboard": "Tableau de bord / Mon profil", "nav.logout": "Se déconnecter", "nav.login": "Se connecter", "nav.register": "S'inscrire", "nav.openMenu": "Ouvrir le menu", "nav.closeMenu": "Fermer le menu",
    "footer.transparency": "Testing-Grounds est gratuit. Les bannières soutiennent les créateurs du site afin de garantir l'hébergement, la maintenance et le développement continu de la plateforme.",
    "home.title": "Beta testing et playtesting pour jeux indépendants et logiciels.", "home.description": "Découvrez les versions Alpha, Closed Beta et Playtest. Envoyez des rapports de bugs, des avis et candidatez comme collaborateur.", "home.gaming": "Explorer Gaming", "home.software": "Explorer les apps",
    "project.translate": "Traduire la fiche projet", "project.showOriginal": "Afficher le texte original", "project.translating": "Traduction...", "project.translationError": "Impossible de traduire la fiche projet. Réessayez plus tard.", "project.translated": "Traduit automatiquement", "project.back": "Retour aux projets", "project.description": "Description",
  },
  de: {
    ...italian, "nav.dashboard": "Dashboard / Mein Profil", "nav.logout": "Abmelden", "nav.login": "Anmelden", "nav.register": "Registrieren", "nav.openMenu": "Menü öffnen", "nav.closeMenu": "Menü schließen",
    "footer.transparency": "Testing-Grounds ist kostenlos. Banner unterstützen die Ersteller der Website und sichern Hosting, Wartung und die kontinuierliche Weiterentwicklung der Plattform.",
    "home.title": "Beta-Tests und Playtests für Indie-Spiele und Software.", "home.description": "Entdecke Alpha-, Closed-Beta- und Playtest-Builds. Reiche strukturierte Bug-Reports und Rezensionen ein oder bewirb dich als Mitwirkende:r.", "home.gaming": "Gaming entdecken", "home.software": "Apps entdecken",
    "project.translate": "Projektseite übersetzen", "project.showOriginal": "Originaltext anzeigen", "project.translating": "Wird übersetzt...", "project.translationError": "Die Projektseite konnte nicht übersetzt werden. Bitte später erneut versuchen.", "project.translated": "Automatisch übersetzt", "project.back": "Zurück zu Projekten", "project.description": "Beschreibung",
  },
  pt: {
    ...italian, "nav.dashboard": "Painel / Meu perfil", "nav.logout": "Sair", "nav.login": "Entrar", "nav.register": "Cadastrar", "nav.openMenu": "Abrir menu", "nav.closeMenu": "Fechar menu",
    "footer.transparency": "Testing-Grounds é gratuito. Os banners apoiam os criadores do site para garantir a hospedagem, manutenção e o desenvolvimento contínuo da plataforma.",
    "home.title": "Beta testing e playtesting para jogos indie e software.", "home.description": "Descubra builds Alpha, Closed Beta e Playtest. Envie relatórios de bugs, avaliações e candidate-se como colaborador.", "home.gaming": "Explorar Gaming", "home.software": "Explorar Apps",
    "project.translate": "Traduzir página do projeto", "project.showOriginal": "Mostrar texto original", "project.translating": "Traduzindo...", "project.translationError": "Não foi possível traduzir a página do projeto. Tente novamente mais tarde.", "project.translated": "Traduzido automaticamente", "project.back": "Voltar aos projetos", "project.description": "Descrição",
  },
  zh: {
    ...italian, "nav.dashboard": "控制台 / 我的资料", "nav.logout": "退出", "nav.login": "登录", "nav.register": "注册", "nav.openMenu": "打开菜单", "nav.closeMenu": "关闭菜单",
    "footer.transparency": "Testing-Grounds 免费使用。广告横幅支持网站创建者，以保障平台的托管、维护和持续开发。",
    "home.title": "面向独立游戏和软件的 Beta 测试与试玩测试。", "home.description": "探索 Alpha、封闭 Beta 和试玩版本。提交结构化错误报告、评测，或申请成为协作者。", "home.gaming": "浏览游戏", "home.software": "浏览应用",
    "project.translate": "翻译项目页面", "project.showOriginal": "显示原文", "project.translating": "正在翻译...", "project.translationError": "无法翻译项目页面，请稍后重试。", "project.translated": "自动翻译", "project.back": "返回项目列表", "project.description": "描述",
  },
  ja: {
    ...italian, "nav.dashboard": "ダッシュボード / プロフィール", "nav.logout": "ログアウト", "nav.login": "ログイン", "nav.register": "登録", "nav.openMenu": "メニューを開く", "nav.closeMenu": "メニューを閉じる",
    "footer.transparency": "Testing-Grounds は無料です。バナー広告は、プラットフォームのホスティング、保守、継続的な開発を支えるためにサイト制作者を支援しています。",
    "home.title": "インディーゲームとソフトウェアのためのベータテストとプレイテスト。", "home.description": "Alpha、Closed Beta、Playtest ビルドを見つけましょう。構造化されたバグ報告やレビューを投稿し、協力者として応募できます。", "home.gaming": "ゲームを見る", "home.software": "アプリを見る",
    "project.translate": "プロジェクトページを翻訳", "project.showOriginal": "原文を表示", "project.translating": "翻訳中...", "project.translationError": "プロジェクトページを翻訳できませんでした。後でもう一度お試しください。", "project.translated": "自動翻訳", "project.back": "プロジェクトに戻る", "project.description": "説明",
  },
};

export function getMessages(locale: Locale) {
  return translations[locale];
}

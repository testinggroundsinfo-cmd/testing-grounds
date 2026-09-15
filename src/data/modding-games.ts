export type ModdingGame = {
  id: string;
  name: string;
  slug: string;
  category: "game";
  cover_url: string;
};

const cover = (name: string) =>
  `https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85&ixlib=rb-4.1.0&txt=${encodeURIComponent(name)}`;

const games = [
  ["minecraft", "Minecraft"],
  ["skyrim", "The Elder Scrolls V: Skyrim"],
  ["grand-theft-auto-v", "Grand Theft Auto V"],
  ["the-witcher-3", "The Witcher 3"],
  ["fallout-4", "Fallout 4"],
  ["cyberpunk-2077", "Cyberpunk 2077"],
  ["stardew-valley", "Stardew Valley"],
  ["terraria", "Terraria"],
  ["red-dead-redemption-2", "Red Dead Redemption 2"],
  ["elden-ring", "Elden Ring"],
  ["baldurs-gate-3", "Baldur's Gate 3"],
  ["monster-hunter-world", "Monster Hunter: World"],
  ["assetto-corsa", "Assetto Corsa"],
  ["the-sims-4", "The Sims 4"],
  ["mount-and-blade-ii-bannerlord", "Mount & Blade II: Bannerlord"],
  ["cities-skylines", "Cities: Skylines"],
  ["civilization-vi", "Civilization VI"],
  ["rimworld", "RimWorld"],
  ["factorio", "Factorio"],
  ["garrys-mod", "Garry's Mod"],
  ["hogwarts-legacy", "Hogwarts Legacy"],
  ["starfield", "Starfield"],
  ["resident-evil-4-remake", "Resident Evil 4 Remake"],
  ["dark-souls-iii", "Dark Souls III"],
  ["ark-survival-evolved", "ARK: Survival Evolved"],
  ["left-4-dead-2", "Left 4 Dead 2"],
  ["payday-2", "Payday 2"],
  ["stalker", "S.T.A.L.K.E.R."],
  ["doom", "DOOM"],
  ["half-life-2", "Half-Life 2"],
  ["subnautica", "Subnautica"],
  ["valheim", "Valheim"],
  ["kerbal-space-program", "Kerbal Space Program"],
  ["palworld", "Palworld"],
  ["manor-lords", "Manor Lords"],
  ["street-fighter-6", "Street Fighter 6"],
  ["tekken-8", "Tekken 8"],
  ["dragon-ball-xenoverse-2", "Dragon Ball Xenoverse 2"],
  ["ea-sports-fc-24", "FIFA / FC 24"],
  ["nba-2k", "NBA 2K"],
  ["marvels-spider-man", "Marvel's Spider-Man"],
  ["god-of-war", "God of War"],
  ["sekiro", "Sekiro"],
  ["devil-may-cry-5", "Devil May Cry 5"],
  ["portal-2", "Portal 2"],
  ["euro-truck-simulator-2", "Euro Truck Simulator 2"],
  ["lethal-company", "Lethal Company"],
  ["helldivers-2", "Helldivers 2"],
  ["dying-light", "Dying Light"],
] as const;

export const moddingGames: ModdingGame[] = games.map(([slug, name], index) => ({
  id: `mod-game-${index + 1}`,
  name,
  slug,
  category: "game",
  cover_url: cover(name),
}));

export const moddingGameBySlug = new Map(
  moddingGames.map((game) => [game.slug, game]),
);

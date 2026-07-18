"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { games, Game } from "./games";
import { Icon } from "@iconify/react";

const classifyGame = (game: Game): string => {
    const name = game.name.toLowerCase();
    if (
        name.includes("puzzle") ||
        name.includes("block") ||
        name.includes("match-3") ||
        name.includes("match 3") ||
        name.includes("brain") ||
        name.includes("dot") ||
        name.includes("physics") ||
        name.includes("unblock") ||
        name.includes("connect") ||
        name.includes("numbers") ||
        name.includes("slide") ||
        name.includes("tiles") ||
        name.includes("sort") ||
        name.includes("jewels") ||
        name.includes("word") ||
        name.includes("maze")
    ) {
        return "Puzzle";
    }
    if (
        name.includes("simulator") ||
        name.includes("evo") ||
        name.includes("cooking") ||
        name.includes("bike") ||
        name.includes("race") ||
        name.includes("racing") ||
        name.includes("parking") ||
        name.includes("driving") ||
        name.includes("truck") ||
        name.includes("hospital") ||
        name.includes("doctor") ||
        name.includes("flight") ||
        name.includes("builder") ||
        name.includes("construction") ||
        name.includes("chef")
    ) {
        return "Simulation";
    }
    if (
        name.includes("action") ||
        name.includes("arcade") ||
        name.includes("angry birds") ||
        name.includes("blast") ||
        name.includes("crazy") ||
        name.includes("adventure") ||
        name.includes("ninja") ||
        name.includes("runner") ||
        name.includes("jump") ||
        name.includes("flip") ||
        name.includes("boss") ||
        name.includes("puppet") ||
        name.includes("bouncemasters") ||
        name.includes("boy") ||
        name.includes("apocalypse") ||
        name.includes("survival") ||
        name.includes("rage") ||
        name.includes("shooting") ||
        name.includes("battle") ||
        name.includes("war") ||
        name.includes("clash") ||
        name.includes("assassins") ||
        name.includes("gta") ||
        name.includes("robber")
    ) {
        return "Action & Arcade";
    }
    return "Casual";
};

const ITEMS_PER_PAGE = 24;

export function Games() {
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [recentPlays, setRecentPlays] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [featuredGame, setFeaturedGame] = useState<Game | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);

    const playerContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedFavs = localStorage.getItem("glassos_game_favs");
        if (savedFavs) {
            try {
                setFavorites(JSON.parse(savedFavs));
            } catch (e) {
                console.error(e);
            }
        }
        const savedRecents = localStorage.getItem("glassos_game_recents");
        if (savedRecents) {
            try {
                setRecentPlays(JSON.parse(savedRecents));
            } catch (e) {
                console.error(e);
            }
        }

        if (games.length > 0) {
            const popularSlugs = [
                "altos-adventure",
                "angry-birds-2",
                "bad-piggies",
                "banana-kong",
                "bridge-construction-simulator",
            ];
            const popularGames = games.filter((g) => popularSlugs.includes(g.slug));
            const chosen =
                popularGames.length > 0
                    ? popularGames[Math.floor(Math.random() * popularGames.length)]
                    : games[Math.floor(Math.random() * games.length)];
            setFeaturedGame(chosen);
        }
    }, []);

    const toggleFavorite = (slug: string) => {
        const nextFavs = favorites.includes(slug)
            ? favorites.filter((s) => s !== slug)
            : [...favorites, slug];
        setFavorites(nextFavs);
        localStorage.setItem("glassos_game_favs", JSON.stringify(nextFavs));
    };

    const addRecentPlay = (slug: string) => {
        const nextRecents = [slug, ...recentPlays.filter((s) => s !== slug)].slice(
            0,
            8
        );
        setRecentPlays(nextRecents);
        localStorage.setItem("glassos_game_recents", JSON.stringify(nextRecents));
    };

    const handlePlayGame = (game: Game) => {
        setActiveGame(game);
        addRecentPlay(game.slug);
    };

    const handleClosePlayer = () => {
        setActiveGame(null);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        }
    };

    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [activeTab, searchQuery]);

    const toggleFullscreen = () => {
        if (!playerContainerRef.current) return;
        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(console.error);
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const refreshIframe = () => {
        setIframeKey((prev) => prev + 1);
    };

    const classifiedGames = useMemo(() => {
        return games.map((game) => ({
            ...game,
            category: classifyGame(game),
        }));
    }, []);

    const filteredGames = useMemo(() => {
        return classifiedGames.filter((game) => {
            if (
                searchQuery &&
                !game.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }

            if (activeTab === "All") return true;
            if (activeTab === "Favorites") return favorites.includes(game.slug);
            if (activeTab === "Recent") return recentPlays.includes(game.slug);
            return game.category === activeTab;
        });
    }, [classifiedGames, activeTab, favorites, recentPlays, searchQuery]);

    const visibleGames = useMemo(() => {
        return filteredGames.slice(0, visibleCount);
    }, [filteredGames, visibleCount]);

    const recentGames = useMemo(() => {
        return recentPlays
            .map((slug) => games.find((g) => g.slug === slug))
            .filter((g): g is Game => !!g);
    }, [recentPlays]);

    if (activeGame) {
        const isFav = favorites.includes(activeGame.slug);
        return (
            <div
                ref={playerContainerRef}
                className="relative flex flex-col bg-zinc-950 w-full h-full overflow-hidden text-white select-none"
            >
                <div className="z-10 flex justify-between items-center bg-zinc-900/80 backdrop-blur-md px-4 border-white/10 border-b h-14 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClosePlayer}
                            className="flex justify-center items-center bg-white/5 hover:bg-white/15 p-2 border border-white/5 rounded-xl text-gray-300 hover:text-white transition-all cursor-pointer"
                            title="Back to Library"
                        >
                            <Icon icon="mdi:arrow-left" width={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <img
                                src={activeGame.image}
                                alt={activeGame.name}
                                className="border border-white/10 rounded-lg w-8 h-8 object-cover"
                            />
                            <span className="max-w-50 sm:max-w-none font-semibold text-sm truncate tracking-wide">
                                {activeGame.name}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleFavorite(activeGame.slug)}
                            className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${isFav
                                ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                                : "bg-white/5 border-white/5 text-gray-300 hover:text-white"
                                }`}
                            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Icon icon={isFav ? "mdi:star" : "mdi:star-outline"} width={20} />
                        </button>
                        <button
                            onClick={refreshIframe}
                            className="flex justify-center items-center bg-white/5 hover:bg-white/15 p-2 border border-white/5 rounded-xl text-gray-300 hover:text-white transition-all cursor-pointer"
                            title="Reload Game"
                        >
                            <Icon icon="mdi:refresh" width={20} />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="flex justify-center items-center bg-white/5 hover:bg-white/15 p-2 border border-white/5 rounded-xl text-gray-300 hover:text-white transition-all cursor-pointer"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            <Icon
                                icon={isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"}
                                width={20}
                            />
                        </button>
                    </div>
                </div>

                <div className="relative flex-1 bg-zinc-950 w-full h-full">
                    <iframe
                        key={iframeKey}
                        src={activeGame.iframe}
                        className="border-none w-full h-full"
                        allow="autoplay; fullscreen; keyboard; gamepad"
                        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                        title={activeGame.name}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 bg-zinc-950/40 backdrop-blur-md h-full overflow-y-hidden text-white select-none">
            <div className="flex flex-col gap-3 bg-white/5 p-4 border-white/5 border-b shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Icon
                            icon="mdi:magnify"
                            className="top-1/2 left-3.5 absolute text-white/40 -translate-y-1/2"
                            width={18}
                        />
                        <input
                            type="text"
                            placeholder="Search 400+ games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 focus:bg-white/10 py-2 pr-4 pl-10 border border-white/10 focus:border-violet-500/50 rounded-xl outline-none w-full placeholder:text-white/30 text-sm transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="top-1/2 right-3 absolute text-white/40 hover:text-white transition-colors -translate-y-1/2 cursor-pointer"
                            >
                                <Icon icon="mdi:close" width={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-1.5 pb-1 overflow-x-auto no-scrollbar shrink-0">
                    {["All", "Favorites", "Recent", "Action & Arcade", "Puzzle", "Simulation", "Casual"].map((tab) => {
                        const isActive = activeTab === tab;
                        let iconName = "mdi:gamepad-variant";
                        if (tab === "Favorites") iconName = "mdi:star";
                        else if (tab === "Recent") iconName = "mdi:clock-outline";
                        else if (tab === "Puzzle") iconName = "mdi:puzzle";
                        else if (tab === "Simulation") iconName = "mdi:steering";
                        else if (tab === "Action & Arcade") iconName = "mdi:sword-cross";
                        else if (tab === "Casual") iconName = "mdi:party-popper";

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${isActive
                                    ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                                    : "bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                <Icon icon={iconName} width={14} />
                                <span>{tab}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 space-y-6 p-4 overflow-y-auto">
                {activeTab === "All" && !searchQuery && featuredGame && (
                    <div className="group relative bg-linear-to-r from-violet-900/60 to-indigo-900/60 border border-white/10 rounded-2xl min-h-35 max-h-55 aspect-21/9 overflow-hidden">
                        <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
                            <img
                                src={featuredGame.image}
                                alt={featuredGame.name}
                                className="blur-[2px] w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                        </div>

                        <div className="z-10 absolute inset-0 flex flex-col justify-end p-5">
                            <span className="bg-violet-600/90 mb-1.5 px-2 py-0.5 rounded-full w-max font-semibold text-[10px] text-white uppercase tracking-wider">
                                Featured Game
                            </span>
                            <h2 className="drop-shadow-md max-w-full font-bold text-white text-lg sm:text-2xl truncate tracking-wide">
                                {featuredGame.name}
                            </h2>
                            <p className="hidden sm:block mt-1 max-w-[80%] text-[11px] text-white/75 line-clamp-2">
                                Experience one of the top hits in GlassOS. Fast-paced, responsive gameplay. Play instantly without download.
                            </p>
                            <div className="mt-2.5">
                                <button
                                    onClick={() => handlePlayGame(featuredGame)}
                                    className="flex items-center gap-1.5 bg-white hover:bg-violet-400 shadow-lg px-4 py-2 rounded-xl font-bold text-zinc-950 hover:text-white text-xs active:scale-95 transition-all cursor-pointer transform"
                                >
                                    <Icon icon="mdi:play" width={16} />
                                    <span>Play Now</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "All" && !searchQuery && recentGames.length > 0 && (
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white/60 text-xs uppercase tracking-wider">
                                Jump Back In
                            </h3>
                        </div>
                        <div className="gap-3 grid grid-cols-4 sm:grid-cols-8">
                            {recentGames.map((game) => (
                                <button
                                    key={game.slug}
                                    onClick={() => handlePlayGame(game)}
                                    className="group flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
                                >
                                    <div className="relative border border-white/10 group-hover:border-violet-500/40 rounded-xl w-full aspect-square overflow-hidden group-hover:scale-105 transition-all duration-300">
                                        <img
                                            src={game.image}
                                            alt={game.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex justify-center items-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Icon icon="mdi:play" className="text-white" width={20} />
                                        </div>
                                    </div>
                                    <span className="w-full font-medium text-[10px] text-white/75 group-hover:text-white truncate">
                                        {game.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white/60 text-xs uppercase tracking-wider">
                            {activeTab === "All" ? "All Games" : `${activeTab} Games`}
                        </h3>
                        <span className="font-medium text-white/40 text-xs">
                            {filteredGames.length} {filteredGames.length === 1 ? "game" : "games"}
                        </span>
                    </div>

                    {visibleGames.length > 0 ? (
                        <div className="gap-3 grid grid-cols-2 sm:grid-cols-3">
                            {visibleGames.map((game) => {
                                const isFav = favorites.includes(game.slug);
                                return (
                                    <div
                                        key={game.slug}
                                        className="group relative flex flex-col bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-xl overflow-hidden transition-all hover:-translate-y-1 duration-300 transform"
                                    >
                                        <div className="relative bg-zinc-900 border-white/5 border-b w-full aspect-4/3 overflow-hidden">
                                            <img
                                                src={game.image}
                                                alt={game.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(game.slug);
                                                }}
                                                className={`absolute top-2 right-2 p-1.5 rounded-lg border transition-all cursor-pointer z-20 ${isFav
                                                    ? "bg-amber-500/20 border-amber-500/30 text-amber-400 opacity-100"
                                                    : "bg-black/60 border-white/10 text-white/60 hover:text-white opacity-0 group-hover:opacity-100"
                                                    }`}
                                            >
                                                <Icon
                                                    icon={isFav ? "mdi:star" : "mdi:star-outline"}
                                                    width={14}
                                                />
                                            </button>

                                            <div
                                                onClick={() => handlePlayGame(game)}
                                                className="z-10 absolute inset-0 flex justify-center items-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <div className="flex justify-center items-center bg-violet-600 shadow-lg rounded-full w-10 h-10 text-white scale-75 group-hover:scale-100 transition-all duration-300 transform">
                                                    <Icon icon="mdi:play" width={20} />
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => handlePlayGame(game)}
                                            className="flex flex-col flex-1 justify-between p-2.5 cursor-pointer"
                                        >
                                            <h4 className="font-semibold text-white/90 group-hover:text-white text-xs line-clamp-1 transition-colors">
                                                {game.name}
                                            </h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] text-white/40">
                                                    {game.category}
                                                </span>
                                                <span className="flex items-center gap-0.5 font-semibold text-[9px] text-violet-400 group-hover:underline">
                                                    Play <Icon icon="mdi:chevron-right" width={10} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center items-center space-y-3 py-12 text-white/40">
                            <Icon icon="mdi:gamepad-circle-down" width={48} className="text-white/20 animate-pulse" />
                            <div className="text-center">
                                <p className="font-semibold text-sm">No games found</p>
                                <p className="mt-1 text-white/30 text-xs">
                                    Try checking your search query or choosing another category.
                                </p>
                            </div>
                        </div>
                    )}

                    {visibleCount < filteredGames.length && (
                        <button
                            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                            className="bg-white/5 hover:bg-white/10 active:bg-white/15 mt-4 py-2.5 border border-white/5 rounded-xl w-full font-sans font-semibold text-white/70 hover:text-white text-xs text-center transition-all cursor-pointer"
                        >
                            Load More Games ({filteredGames.length - visibleCount} remaining)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
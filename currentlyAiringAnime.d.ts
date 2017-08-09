export declare type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
export declare type Options = {
    malId?: number | number[];
    aniId?: number | number[];
    userId?: number | number[];
    season?: Season;
    seasonYear?: number | number[];
};
export declare type AiringEpisode = {
    id: number;
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
};
export declare type Media = {
    id: number;
    idMal: number;
    title: {
        romaji: string;
        english: string;
        native: string;
    };
    studios: {
        edges: {
            node: {
                name: string;
            };
        }[];
    };
    genres: string[];
    status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED';
    coverImage: {
        large: string;
    };
    episodes: number;
    nextAiringEpisode: AiringEpisode;
    airingSchedule: {
        edges: {
            node: AiringEpisode;
        }[];
    };
};
export declare type AiringAnime = {
    shows: Media[];
    next: () => Promise<AiringAnime> | null;
};
declare function currentlyAiringAnime(options?: Options): Promise<AiringAnime>;
export default currentlyAiringAnime;

import z from "zod";
declare const ratingSchema: z.ZodObject<{
    text: z.ZodString;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    text: string;
    score: number;
}, {
    text: string;
    score: number;
}>;
export type Rating = z.infer<typeof ratingSchema>;
declare const getImageSchema: z.ZodObject<{
    tiny: z.ZodOptional<z.ZodString>;
    small: z.ZodOptional<z.ZodString>;
    medium: z.ZodOptional<z.ZodString>;
    large: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tiny?: string | undefined;
    small?: string | undefined;
    medium?: string | undefined;
    large?: string | undefined;
}, {
    tiny?: string | undefined;
    small?: string | undefined;
    medium?: string | undefined;
    large?: string | undefined;
}>;
export type Image = z.infer<typeof getImageSchema>;
declare const listFilms: z.ZodObject<{
    title: z.ZodString;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    uri: string;
}, {
    title: string;
    uri: string;
}>;
export type ListFilms = z.infer<typeof listFilms>;
declare const List: z.ZodObject<{
    type: z.ZodLiteral<"list">;
    date: z.ZodObject<{
        published: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        published: number;
    }, {
        published: number;
    }>;
    title: z.ZodString;
    description: z.ZodString;
    ranked: z.ZodBoolean;
    films: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        uri: string;
    }, {
        title: string;
        uri: string;
    }>, "many">;
    totalFilms: z.ZodNumber;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "list";
    title: string;
    description: string;
    date: {
        published: number;
    };
    uri: string;
    ranked: boolean;
    films: {
        title: string;
        uri: string;
    }[];
    totalFilms: number;
}, {
    type: "list";
    title: string;
    description: string;
    date: {
        published: number;
    };
    uri: string;
    ranked: boolean;
    films: {
        title: string;
        uri: string;
    }[];
    totalFilms: number;
}>;
declare const diary: z.ZodObject<{
    type: z.ZodLiteral<"diary">;
    date: z.ZodObject<{
        published: z.ZodNumber;
        watched: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        published: number;
        watched: number;
    }, {
        published: number;
        watched: number;
    }>;
    film: z.ZodObject<{
        title: z.ZodString;
        year: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodObject<{
            tiny: z.ZodOptional<z.ZodString>;
            small: z.ZodOptional<z.ZodString>;
            medium: z.ZodOptional<z.ZodString>;
            large: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            tiny?: string | undefined;
            small?: string | undefined;
            medium?: string | undefined;
            large?: string | undefined;
        }, {
            tiny?: string | undefined;
            small?: string | undefined;
            medium?: string | undefined;
            large?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        year?: string | undefined;
        image?: {
            tiny?: string | undefined;
            small?: string | undefined;
            medium?: string | undefined;
            large?: string | undefined;
        } | undefined;
    }, {
        title: string;
        year?: string | undefined;
        image?: {
            tiny?: string | undefined;
            small?: string | undefined;
            medium?: string | undefined;
            large?: string | undefined;
        } | undefined;
    }>;
    rating: z.ZodObject<{
        text: z.ZodString;
        score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        text: string;
        score: number;
    }, {
        text: string;
        score: number;
    }>;
    review: z.ZodOptional<z.ZodString>;
    spoilers: z.ZodOptional<z.ZodBoolean>;
    isRewatch: z.ZodOptional<z.ZodBoolean>;
    uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "diary";
    date: {
        published: number;
        watched: number;
    };
    uri: string;
    film: {
        title: string;
        year?: string | undefined;
        image?: {
            tiny?: string | undefined;
            small?: string | undefined;
            medium?: string | undefined;
            large?: string | undefined;
        } | undefined;
    };
    rating: {
        text: string;
        score: number;
    };
    review?: string | undefined;
    spoilers?: boolean | undefined;
    isRewatch?: boolean | undefined;
}, {
    type: "diary";
    date: {
        published: number;
        watched: number;
    };
    uri: string;
    film: {
        title: string;
        year?: string | undefined;
        image?: {
            tiny?: string | undefined;
            small?: string | undefined;
            medium?: string | undefined;
            large?: string | undefined;
        } | undefined;
    };
    rating: {
        text: string;
        score: number;
    };
    review?: string | undefined;
    spoilers?: boolean | undefined;
    isRewatch?: boolean | undefined;
}>;
export type Diary = z.infer<typeof diary>;
export type List = z.infer<typeof List>;
export type Letterboxd = Diary | List;
declare function letterboxd(username: string): Promise<Letterboxd[]>;
export default letterboxd;

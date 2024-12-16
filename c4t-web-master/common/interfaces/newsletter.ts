export interface INewsletter {
    sys: {
        id: string;
    };
    graphic: {
        url: string;
        width: number;
        height: number;
    };
    date: string;
    title: string;
    placeholderDataURL?: string | null;
}

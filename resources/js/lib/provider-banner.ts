const bannerThemes = [
    {
        keywords: [
            'beauty',
            'salon',
            'hair',
            'barber',
            'barbing',
            'makeup',
            'nail',
            'spa',
            'massage',
        ],
        name: 'beauty',
    },
    {
        keywords: ['education', 'tutor', 'lesson', 'training'],
        name: 'education',
    },
    {
        keywords: ['event', 'photography', 'photo', 'video'],
        name: 'events-photography',
    },
    {
        keywords: ['fitness', 'wellness', 'yoga', 'trainer', 'gym'],
        name: 'fitness-wellness',
    },
    {
        keywords: [
            'home',
            'plumbing',
            'electrical',
            'cleaning',
            'repair',
            'carpentry',
        ],
        name: 'home-services',
    },
];

export const getProviderDefaultBanner = (
    category: string | null | undefined,
    providerId: string | number,
): string => {
    const normalizedCategory = category?.toLowerCase() ?? '';
    const theme = bannerThemes.find(({ keywords }) =>
        keywords.some((keyword) => normalizedCategory.includes(keyword)),
    );
    const stableId = Array.from(String(providerId)).reduce(
        (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
        0,
    );
    const variant = stableId % 2 === 0 ? 'light' : 'dark';

    return `/brand/banners/proxideck-banner-${theme?.name ?? 'general'}-${variant}.jpg`;
};

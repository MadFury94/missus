// Garment-only derivatives of the existing Wearlux photography.
// Match by source photo so a different catalog cannot inherit the wrong cutout.
const photos = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
const bottoms = new Set([16, 21, 31, 41, 56]);

export function getRackImage(source: string) {
    const match = /^\/wearlux\/images\/wearlux(?:%20| )\((\d+)\)\.jpeg$/.exec(source);
    const photo = match ? Number(match[1]) : 0;
    return photos.includes(photo) ? {
        image: `/wearlux/rack/garment-${photo}.png`,
        hanger: bottoms.has(photo) ? "clips" as const : "shoulders" as const,
    } : { image: source, hanger: "shoulders" as const };
}

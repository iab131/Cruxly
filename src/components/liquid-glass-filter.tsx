/**
 * Global SVG filters producing Apple-style "liquid glass" edge refraction.
 *
 * An `feDisplacementMap` bends the backdrop using a map image where the RED
 * channel drives horizontal shift and GREEN drives vertical (0x80 = neutral).
 * The map is neutral in the middle and ramps at the borders, so the backdrop
 * refracts at the rim — the convex-lens look of Apple's Liquid Glass.
 *
 * Empirically verified (headless Chrome screenshots): `feImage` inside a
 * `backdrop-filter` silently fails unless it has explicit dimensions. Using
 * `primitiveUnits="objectBoundingBox"` with a 1×1 feImage both fixes that and
 * makes one filter adapt to any element size. NOTE: with objectBoundingBox
 * units every primitive length is a *fraction* of the element size — the
 * displacement `scale` here is a fraction of the bounding-box diagonal, and
 * adding e.g. feGaussianBlur with px-like values would blow up. Keep maps
 * smooth via their gradients instead.
 *
 * Only Chromium renders SVG filters in `backdrop-filter`; other engines get
 * the translucent-blur fallback in globals.css.
 */

/**
 * Displacement-map data URI. `edge` is the fraction (0–0.5) of each axis over
 * which displacement acts; the magnitude follows a convex-lens profile —
 * full at the border, falling off steeply inward ((1-u)^2.5, approximating
 * Apple's squircle glass edge) — instead of a linear ramp, which reads as a
 * smear rather than a bent glass rim. R = horizontal shift, G = vertical.
 */
function displacementMapHref(edge: number): string {
    // Sample the falloff curve: u = 0 at the border → 1 at the band's inner edge.
    const CURVE_SAMPLES = 8
    const samples = Array.from({ length: CURVE_SAMPLES + 1 }, (_, i) => {
        const u = i / CURVE_SAMPLES
        return { u, m: Math.pow(1 - u, 2.5) }
    })

    // channel: hex pair for the displaced channel value 128 ± 127·m
    const hex = (v: number) => Math.round(v).toString(16).padStart(2, "0")
    const stops = (axis: "r" | "g") =>
        [
            // near side: displacement negative (sample outward)
            ...samples.map(({ u, m }) => {
                const v = 128 - 127 * m
                const c = axis === "r" ? `#${hex(v)}0000` : `#00${hex(v)}00`
                return `<stop offset='${(u * edge).toFixed(3)}' stop-color='${c}'/>`
            }),
            // far side: mirrored, displacement positive
            ...samples
                .slice()
                .reverse()
                .map(({ u, m }) => {
                    const v = 128 + 127 * m
                    const c = axis === "r" ? `#${hex(v)}0000` : `#00${hex(v)}00`
                    return `<stop offset='${(1 - u * edge).toFixed(3)}' stop-color='${c}'/>`
                }),
        ].join("")

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><linearGradient id='rx' x1='0' y1='0' x2='1' y2='0'>${stops("r")}</linearGradient><linearGradient id='gy' x1='0' y1='0' x2='0' y2='1'>${stops("g")}</linearGradient></defs><rect width='400' height='400' fill='#000'/><rect width='400' height='400' fill='url(#rx)' style='mix-blend-mode:screen'/><rect width='400' height='400' fill='url(#gy)' style='mix-blend-mode:screen'/></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

interface GlassFilterDef {
    id: string
    /** rim thickness as fraction of the element (0–0.5) */
    edge: number
    /** displacement as fraction of the element's bounding-box diagonal */
    scale: number
}

// #liquid-glass    → chips/pills: wide rim relative to their small size.
// #liquid-glass-lg → large surfaces (top bars): tight rim, gentler relative bend.
const FILTERS: GlassFilterDef[] = [
    { id: "liquid-glass", edge: 0.4, scale: 0.15 },
    { id: "liquid-glass-lg", edge: 0.12, scale: 0.04 },
]

export function LiquidGlassFilter() {
    return (
        <svg
            aria-hidden="true"
            style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
        >
            <defs>
                {FILTERS.map(({ id, edge, scale }) => (
                    <filter
                        key={id}
                        id={id}
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        primitiveUnits="objectBoundingBox"
                        colorInterpolationFilters="sRGB"
                    >
                        <feImage
                            href={displacementMapHref(edge)}
                            x={0}
                            y={0}
                            width={1}
                            height={1}
                            preserveAspectRatio="none"
                            result="map"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="map"
                            scale={scale}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                ))}
            </defs>
        </svg>
    )
}

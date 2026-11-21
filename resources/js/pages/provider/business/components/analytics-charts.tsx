import { useMemo } from 'react';
import { Chart, type AxisOptions } from 'react-charts';

const forest = '#0E3B2E';
const lime = '#C8F169';
const mint = '#C9E2D3';

const isDarkMode = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

const formatNaira = (value: number) => `₦${Math.round(value).toLocaleString()}`;

const compactNaira = (value: number) =>
    `₦${new Intl.NumberFormat('en', { notation: 'compact' }).format(value)}`;

interface RevenuePoint {
    label: string;
    value: number;
}

/**
 * Revenue over time as a filled area chart with a hover tooltip.
 */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
    const dark = isDarkMode();
    const color = dark ? lime : forest;

    const series = useMemo(() => [{ label: 'Revenue', data }], [data]);

    const primaryAxis = useMemo<AxisOptions<RevenuePoint>>(
        () => ({
            getValue: (point) => point.label,
            scaleType: 'band',
            outerBandPadding: 0,
        }),
        [],
    );

    const secondaryAxes = useMemo<AxisOptions<RevenuePoint>[]>(
        () => [
            {
                getValue: (point) => point.value,
                elementType: 'area',
                min: 0,
                formatters: {
                    scale: (value: number) => compactNaira(value ?? 0),
                    tooltip: (value: number) => formatNaira(value ?? 0),
                },
            },
        ],
        [],
    );

    if (typeof window === 'undefined') {
        return <div className="h-[240px]" />;
    }

    return (
        <div className="h-[240px] w-full">
            <Chart
                options={{
                    data: series,
                    primaryAxis,
                    secondaryAxes,
                    dark,
                    defaultColors: [color],
                    getSeriesStyle: () => ({
                        color,
                        area: { fill: color, opacity: 0.12 },
                        line: { strokeWidth: 3 },
                    }),
                }}
            />
        </div>
    );
}

interface PeakHourPoint {
    hour: number;
    display: string;
    bookings: number;
}

/**
 * Bookings per starting hour as a bar chart, with the busiest hour highlighted.
 */
export function PeakHoursChart({
    data,
    busiestHour,
}: {
    data: PeakHourPoint[];
    busiestHour: number | null;
}) {
    const dark = isDarkMode();

    const series = useMemo(() => [{ label: 'Bookings', data }], [data]);

    const primaryAxis = useMemo<AxisOptions<PeakHourPoint>>(
        () => ({
            getValue: (point) => point.display,
            scaleType: 'band',
        }),
        [],
    );

    const secondaryAxes = useMemo<AxisOptions<PeakHourPoint>[]>(
        () => [
            {
                getValue: (point) => point.bookings,
                elementType: 'bar',
                min: 0,
                showGrid: true,
                formatters: {
                    scale: (value: number) =>
                        Number.isInteger(value) ? String(value) : '',
                    tooltip: (value: number) =>
                        `${value ?? 0} booking${value === 1 ? '' : 's'}`,
                },
            },
        ],
        [],
    );

    if (typeof window === 'undefined') {
        return <div className="h-[190px]" />;
    }

    return (
        <div className="h-[190px] w-full">
            <Chart
                options={{
                    data: series,
                    primaryAxis,
                    secondaryAxes,
                    dark,
                    defaultColors: [dark ? lime : forest],
                    getDatumStyle: (datum) => {
                        const isPeak =
                            busiestHour !== null &&
                            datum.originalDatum.hour === busiestHour;

                        return {
                            color: isPeak
                                ? dark
                                    ? lime
                                    : forest
                                : dark
                                  ? 'rgba(255,255,255,0.18)'
                                  : mint,
                            rectangle: { rx: 6, ry: 6 },
                        };
                    },
                }}
            />
        </div>
    );
}

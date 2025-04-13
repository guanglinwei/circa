// TODO: calculating stats from the data in the DB

import { Point } from "../components/Plot";

export const getAveragePoints = (points: Point[]): Point[] => {
    const map = new Map<number, { sum: number, count: number }>();
    for (const { x, y } of points) {
        if (!map.has(x)) {
            map.set(x, { sum: y, count: 1 });
        } else {
            const entry = map.get(x)!;
            entry.sum += y;
            entry.count += 1;
        }
    }
    const result: Point[] = [];
    for (const [x, { sum, count }] of map.entries()) {
        result.push({ x, y: sum / count });
    }

    result.sort((a, b) => a.x - b.x);

    return result;
};
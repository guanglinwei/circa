import { useContext, useEffect, useRef, useState } from "react";
import { Axis, LineSeries, XYChart } from "@visx/xychart";
import { Drag } from "@visx/drag";
import { Circle } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import DataContext from "../context/DataContext";
import { getAveragePoints } from "../utils/energyMetrics";

export type Point = { x: number; y: number; };

const WIDTH = 800;
const HEIGHT = 400;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const X_RANGE = [0, 24];
const Y_RANGE = [0, 10];
const X_DIST = X_RANGE[1] - X_RANGE[0];
const Y_DIST = Y_RANGE[1] - Y_RANGE[0];

function Plot({ setErrors, currDate }: { setErrors: (err: string) => void, currDate?: Date }) {
    const [points, setPoints] = useState<Point[]>([
        { x: X_RANGE[0], y: Y_RANGE[0] + Math.round(Y_DIST / 2) },
        { x: X_RANGE[1], y: Y_RANGE[0] + Math.round(Y_DIST / 2) }
    ]);

    const { userData, deleteAllGraphs } = useContext(DataContext);
    const [averagePoints, setAveragePoints] = useState<Point[]>([]);
    // const prevDate = useRef<Date | null>(null);

    // useEffect(() => {
    //     console.log(prevDate.current, currDate)
    //     if ((prevDate.current?.getTime() || 0) - (currDate?.getTime() || 0) <= 1000000) {
    //         loadFirebaseUserData?.();
    //         console.log('asdfasdf')
    //     }

    //     prevDate.current = currDate || null;
    //     console.log(prevDate.current);
    // }, [currDate]);

    useEffect(() => {
        console.log(userData);
        setAveragePoints(getAveragePoints(userData.map((v) => v.points).flat()))
    }, [userData]);

    const copyPointsArray = (pointsArr: Point[]): Point[] => {
        const res: Point[] = [];
        for (const p of pointsArr) {
            res.push({ x: p.x, y: p.y });
        }
        return res;
    };

    const lastSavedPoints = useRef<Point[]>(copyPointsArray(points));

    // Fixes weird bug where drag gets offset if dragged to invalid position
    const wasDragging = useRef<boolean>(false);
    const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const { uploadEnergyGraph } = useContext(DataContext);

    const getClosestValidXCoord = (x: number, okIndex: number | undefined = undefined): number => {
        if (okIndex === 0) return 0;
        if (okIndex === points.length - 1) return X_RANGE[1];
        x = Math.round(x);
        if (x === X_RANGE[0] && !points.some((v) => v.x === X_RANGE[0])) return X_RANGE[0] + 1;
        if (x === X_RANGE[1] && !points.some((v) => v.x === X_RANGE[1] - 1)) return X_RANGE[1] - 1;
        if (!points.some((v, i) => v.x === x && (i !== okIndex))) return x;
        if (x !== X_RANGE[0] && !points.some((v) => v.x === x - 1)) return x - 1;
        if (x !== X_RANGE[1] && !points.some((v) => v.x === x + 1)) return x + 1;

        return -1;
    };

    // 0, 0 | 24, 10 --> 50, 350 | 750, 50
    const updatePoint = (index: number, x: number | undefined, y: number | undefined, dx: number, dy: number,
        final: boolean = true, wasDragged: boolean = false) => {
        if (x === undefined || y === undefined) return;

        const newX = X_DIST * (x + dx - margin.left) / (WIDTH - margin.left - margin.right);
        const newY = -Y_DIST * (y + dy - HEIGHT + margin.bottom) / (HEIGHT - margin.top - margin.bottom);
        let clampedX = Math.max(X_RANGE[0], Math.min(X_RANGE[1], newX));
        let clampedY = Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], newY));
        if (final) {
            clampedX = Math.round(clampedX);
            clampedY = Math.round(clampedY);
        }
        clampedX = getClosestValidXCoord(clampedX, index);
        const updated = [...points];
        if (clampedX !== -1) updated[index] = { x: Math.round(clampedX), y: Math.round(clampedY) };
        if (final) {
            updated.sort((a, b) => a.x - b.x);
            if (index === 0) updated[updated.length - 1].y = updated[0].y;
            else if (index === updated.length - 1) updated[0].y = updated[updated.length - 1].y
            setPoints(updated);
            if (wasDragged) {
                wasDragging.current = false;
                dragOffset.current = { x: 0, y: 0 };
            }
        }
    };

    const accessors = {
        xAccessor: (d: Point) => d.x,
        yAccessor: (d: Point) => d.y,
    };

    const uploadPointsToDB = () => {
        console.log(points);
        if (points.length < 2 || points.length > X_DIST + 1) {
            setErrors('Invalid number of points');
            return;
        }
        else if (points.some((v) =>
            v.x > X_RANGE[1] ||
            v.x < X_RANGE[0] ||
            v.y > Y_RANGE[1] ||
            v.y < Y_RANGE[0])) {
            setErrors('Invalid point coordinates');
            return;
        }
        else {
            // ...
        }

        lastSavedPoints.current = copyPointsArray(points);
        uploadEnergyGraph?.(points, currDate || new Date(), true, true);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const svg = e.currentTarget.childNodes[0] as SVGSVGElement;
        if (!svg) return;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;

        const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

        if (!svgPoint) return;

        const newX = X_DIST * (svgPoint.x - margin.left) / (WIDTH - margin.left - margin.right);
        const newY = -Y_DIST * (svgPoint.y - HEIGHT + margin.bottom) / (HEIGHT - margin.top - margin.bottom);
        let clampedX = Math.round(Math.max(X_RANGE[0], Math.min(X_RANGE[1], newX)));
        let clampedY = Math.round(Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], newY)));
        if (clampedX === X_RANGE[0] && points.some((v) => v.x === X_RANGE[0])) {
            clampedX = X_RANGE[0] + 1;
        }
        if (clampedX === X_RANGE[1] && points.some((v) => v.x === X_RANGE[1])) {
            clampedX = X_RANGE[1] - 1;
        }
        if (points.some((v) => v.x === clampedX && v.y === clampedY)) {
            return;
        }

        const possibleX = getClosestValidXCoord(clampedX);
        if (possibleX === -1) {
            const updated = [...points];
            for (let i = 0; i < updated.length; i++) {
                if (updated[i].x === clampedX) {
                    updated[i].y = clampedY;
                }
            }
            setPoints(updated);
            return;
        }

        const updated = [...points, { x: possibleX, y: clampedY }];
        updated.sort((a, b) => a.x - b.x);
        setPoints(updated);
    };

    const handleRightClick = (e: React.MouseEvent<Element, MouseEvent>, index: number) => {
        e.preventDefault();
        if (index === 0 || index === points.length - 1) {
            return;
        }
        setPoints((old) => old.filter((_, i) => i !== index));
    };

    return (
        <>
            <button className='rounded-md bg-gray-200 px-2 cursor-pointer' onClick={() => {
                deleteAllGraphs?.();
            }}>Delete my data</button>
            <button className='rounded-md bg-gray-200 px-2 cursor-pointer' onClick={() => {
                uploadPointsToDB();
            }}>UPLOAD</button>
            <div className='select-none' onDoubleClick={handleDoubleClick}>
                <XYChart
                    height={HEIGHT}
                    width={WIDTH}
                    xScale={{ type: 'linear', domain: X_RANGE }}
                    yScale={{ type: 'linear', domain: Y_RANGE }}
                    captureEvents={false}
                >
                    <Axis orientation='bottom' />
                    <Axis orientation='left' />
                    <LineSeries
                        dataKey='Line'
                        data={points}
                        {...accessors}
                        curve={curveMonotoneX} />

                    <LineSeries
                        dataKey='AvgLine'
                        data={averagePoints}
                        {...accessors}
                        curve={curveMonotoneX} />

                    {points.map((point, i) => (
                        <Drag
                            key={i}
                            x={point.x}
                            y={point.y}
                            width={WIDTH}
                            height={HEIGHT}
                            onDragMove={({ x, y, dx, dy }) => updatePoint(i, x, y, dx, dy, false, true)}
                            onDragEnd={({ x, y, dx, dy }) => updatePoint(i, x, y, dx, dy, true, true)}
                            captureDragArea
                            restrict={{
                                xMin: 0,
                                xMax: WIDTH,
                                yMin: 0,
                                yMax: HEIGHT,
                            }}
                        >
                            {({ dragStart, dragEnd, dragMove, isDragging, dx, dy }) => {
                                if (isDragging) {
                                    dx = dx * X_DIST / (WIDTH - margin.left - margin.right);
                                    dy = dy * Y_DIST / (HEIGHT - margin.top - margin.bottom);
                                } else {
                                    dx = 0;
                                    dy = 0;
                                }
                                if (!wasDragging.current && isDragging) {
                                    dragOffset.current = { x: dx, y: dy };
                                }
                                const newX = point.x + dx - (isDragging ? dragOffset.current.x : 0);
                                const newY = point.y - dy + (isDragging ? dragOffset.current.y : 0);
                                const xPos = (newX / X_DIST) * (WIDTH - margin.left - margin.right) + margin.left;
                                const yPos = HEIGHT - margin.bottom - newY * (HEIGHT - margin.top - margin.bottom) / Y_DIST;

                                if (isDragging) {
                                    wasDragging.current = isDragging;
                                }

                                return (
                                    <Circle
                                        key={`dot-${i}`}
                                        cx={xPos}
                                        cy={yPos}
                                        r={isDragging ? 8 : 6}
                                        fill={isDragging ? 'blue' : 'blue'}
                                        onMouseMove={dragMove}
                                        onMouseUp={dragEnd}
                                        onContextMenu={(e) => { handleRightClick(e, i) }}
                                        onMouseDown={dragStart}
                                        onTouchStart={dragStart}
                                        onTouchMove={dragMove}
                                        onTouchEnd={dragEnd}
                                    />
                                );
                            }}
                        </Drag>
                    ))}
                </XYChart>
            </div>
        </>
    );
}

export default Plot;


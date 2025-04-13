import { useContext, useRef, useState } from "react";
import { Axis, LineSeries, XYChart } from "@visx/xychart";
import { Drag } from "@visx/drag";
import { Circle } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import DataContext from "../context/DataContext";

export type Point = { x: number; y: number; };

const WIDTH = 800;
const HEIGHT = 400;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

function Plot() {
    const [points, setPoints] = useState<Point[]>([
        { x: 0, y: 5 },
        { x: 24, y: 5 }
    ]);

    // Fixes weird bug where drag gets offset if dragged to invalid position
    const wasDragging = useRef<boolean>(false);
    const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const { uploadEnergyGraph } = useContext(DataContext);

    const getClosestValidXCoord = (x: number, okIndex: number | undefined = undefined): number => {
        if (okIndex === 0) return 0;
        if (okIndex === points.length - 1) return 24;
        x = Math.round(x);
        if (x === 0 && !points.some((v) => v.x === 1)) return 1;
        if (x === 24 && !points.some((v) => v.x === 23)) return 23;
        if (!points.some((v, i) => v.x === x && (i !== okIndex))) return x;
        if (x !== 0 && !points.some((v) => v.x === x - 1)) return x - 1;
        if (x !== 24 && !points.some((v) => v.x === x + 1)) return x + 1;

        return -1;
    };

    // 0, 0 | 24, 10 --> 50, 350 | 750, 50
    const updatePoint = (index: number, x: number | undefined, y: number | undefined, dx: number, dy: number,
        final: boolean = true, wasDragged: boolean = false) => {
        if (x === undefined || y === undefined) return;

        const newX = 24 * (x + dx - margin.left) / (WIDTH - margin.left - margin.right);
        const newY = -10 * (y + dy - HEIGHT + margin.bottom) / (HEIGHT - margin.top - margin.bottom);
        let clampedX = Math.max(0, Math.min(24, newX));
        let clampedY = Math.max(0, Math.min(10, newY));
        if (final) {
            clampedX = Math.round(clampedX);
            clampedY = Math.round(clampedY);
        }
        clampedX = getClosestValidXCoord(clampedX, index);
        const updated = [...points];
        if (clampedX !== -1) updated[index] = { x: Math.round(clampedX), y: Math.round(clampedY) };
        if (final) {
            updated.sort((a, b) => a.x - b.x);
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
        uploadEnergyGraph?.(points);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const svg = e.currentTarget.childNodes[0] as SVGSVGElement;
        if (!svg) return;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;

        const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

        if (!svgPoint) return;

        const newX = 24 * (svgPoint.x - margin.left) / (WIDTH - margin.left - margin.right);
        const newY = -10 * (svgPoint.y - HEIGHT + margin.bottom) / (HEIGHT - margin.top - margin.bottom);
        let clampedX = Math.round(Math.max(0, Math.min(24, newX)));
        let clampedY = Math.round(Math.max(0, Math.min(10, newY)));
        if (clampedX === 0 && points.some((v) => v.x === 0)) {
            clampedX = 1;
        }
        if (clampedX === 24 && points.some((v) => v.x === 24)) {
            clampedX = 23;
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
            <button onClick={() => {
                console.log(points)
            }}>print State</button>
            <button onClick={() => {
                uploadPointsToDB();
            }}>UPLOAD</button>
            <div className='select-none' onDoubleClick={handleDoubleClick}>
                <XYChart
                    height={HEIGHT}
                    width={WIDTH}
                    xScale={{ type: 'linear', domain: [0, 24] }}
                    yScale={{ type: 'linear', domain: [0, 10] }}
                    captureEvents={false}
                >
                    <Axis orientation='bottom' />
                    <Axis orientation='left' />
                    <LineSeries
                        dataKey='Line'
                        data={points}
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
                                    dx = dx * 24 / (WIDTH - margin.left - margin.right);
                                    dy = dy * 10 / (HEIGHT - margin.top - margin.bottom);
                                } else {
                                    dx = 0;
                                    dy = 0;
                                }
                                if (!wasDragging.current && isDragging) {
                                    dragOffset.current = { x: dx, y: dy };
                                }
                                const newX = point.x + dx - (isDragging ? dragOffset.current.x : 0);
                                const newY = point.y - dy + (isDragging ? dragOffset.current.y : 0);
                                const xPos = (newX / 24) * (WIDTH - margin.left - margin.right) + margin.left;
                                const yPos = HEIGHT - margin.bottom - newY * (HEIGHT - margin.top - margin.bottom) / 10;
                                
                                if (isDragging) {
                                    wasDragging.current = isDragging;
                                }

                                return (
                                    <Circle
                                        key={`dot-${i}`}
                                        cx={xPos}
                                        cy={yPos}
                                        r={isDragging ? 8 : 6}
                                        fill={isDragging ? 'orange' : 'red'}
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


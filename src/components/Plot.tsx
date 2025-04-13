import { useContext, useEffect, useRef, useState } from "react";
import { AnimatedLineSeries, Axis, XYChart } from "@visx/xychart";
import { Drag } from "@visx/drag";
import { Circle } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import DataContext from "../context/DataContext";
import { getAveragePoints } from "../utils/energyMetrics";
import Tooltip from "./ui/Tooltip";
import { Button } from "./ui/button";
import { CircleHelp } from "lucide-react";

export type Point = { x: number; y: number };

const WIDTH = 800;
const HEIGHT = 400;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const X_RANGE = [0, 24];
const Y_RANGE = [0, 10];
const X_DIST = X_RANGE[1] - X_RANGE[0];
const Y_DIST = Y_RANGE[1] - Y_RANGE[0];

function Plot({
    setErrors,
    currDate,
}: {
    setErrors: (err: string) => void;
    currDate?: Date;
}) {
    const [points, setPoints] = useState<Point[]>([
        { x: X_RANGE[0], y: Y_RANGE[0] + Math.round(Y_DIST / 2) },
        { x: X_RANGE[1], y: Y_RANGE[0] + Math.round(Y_DIST / 2) },
    ]);

    const { userData, loadFirebaseUserData } = useContext(DataContext);
    const [averagePoints, setAveragePoints] = useState<Point[]>([]);
    const [currentHoverIndex, setCurrentHoverIndex] = useState<number | null>(
        null
    );
    const [width, setWidth] = useState(WIDTH);
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

    const getWidth = () => {
        const w = window.innerWidth;
        if (w < 640) return 300;
        if (w < 768) return 400;
        if (w < 1024) return 600;
        return 800;
    };

    useEffect(() => {
        const handleResize = () => setWidth(getWidth());
        window.addEventListener("resize", handleResize);
        handleResize();
        loadFirebaseUserData?.();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        setAveragePoints(getAveragePoints(userData.map((v) => v.points).flat()));
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
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const { uploadEnergyGraph } = useContext(DataContext);

    const getClosestValidXCoord = (
        x: number,
        okIndex: number | undefined = undefined
    ): number => {
        if (okIndex === 0) return 0;
        if (okIndex === points.length - 1) return X_RANGE[1];
        x = Math.round(x);
        if (x === X_RANGE[0] && !points.some((v) => v.x === X_RANGE[0]))
            return X_RANGE[0] + 1;
        if (x === X_RANGE[1] && !points.some((v) => v.x === X_RANGE[1] - 1))
            return X_RANGE[1] - 1;
        if (!points.some((v, i) => v.x === x && i !== okIndex)) return x;
        if (x !== X_RANGE[0] && !points.some((v) => v.x === x - 1)) return x - 1;
        if (x !== X_RANGE[1] && !points.some((v) => v.x === x + 1)) return x + 1;

        return -1;
    };

    // 0, 0 | 24, 10 --> 50, 350 | 750, 50
    const updatePoint = (
        index: number,
        x: number | undefined,
        y: number | undefined,
        dx: number,
        dy: number,
        final: boolean = true,
        wasDragged: boolean = false
    ) => {
        if (x === undefined || y === undefined) return;

        const newX =
            (X_DIST * (x + dx - margin.left)) / (width - margin.left - margin.right);
        const newY =
            (-Y_DIST * (y + dy - HEIGHT + margin.bottom)) /
            (HEIGHT - margin.top - margin.bottom);
        let clampedX = Math.max(X_RANGE[0], Math.min(X_RANGE[1], newX));
        let clampedY = Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], newY));
        if (final) {
            clampedX = Math.round(clampedX);
            clampedY = Math.round(clampedY);
        }
        clampedX = getClosestValidXCoord(clampedX, index);
        const updated = [...points];
        if (clampedX !== -1)
            updated[index] = { x: Math.round(clampedX), y: Math.round(clampedY) };
        if (final) {
            updated.sort((a, b) => a.x - b.x);
            if (index === 0) updated[updated.length - 1].y = updated[0].y;
            else if (index === updated.length - 1)
                updated[0].y = updated[updated.length - 1].y;
            setPoints(updated);
            if (wasDragged) {
                wasDragging.current = false;
                dragOffset.current = { x: 0, y: 0 };
            }
            setCurrentHoverIndex(null);
        }
    };

    const accessors = {
        xAccessor: (d: Point) => d.x,
        yAccessor: (d: Point) => d.y,
    };

    const uploadPointsToDB = () => {
        console.log(points);
        if (points.length < 2 || points.length > X_DIST + 1) {
            setErrors("Invalid number of points");
            return;
        } else if (
            points.some(
                (v) =>
                    v.x > X_RANGE[1] ||
                    v.x < X_RANGE[0] ||
                    v.y > Y_RANGE[1] ||
                    v.y < Y_RANGE[0]
            )
        ) {
            setErrors("Invalid point coordinates");
            return;
        } else {
            // ...
        }

        lastSavedPoints.current = copyPointsArray(points);
        uploadEnergyGraph?.(points, currDate || new Date(), true, true);
    };

    const handleDoubleClick = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        const svg = e.currentTarget.childNodes[0] as SVGSVGElement;
        if (!svg) return;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;

        const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

        if (!svgPoint) return;

        const newX =
            (X_DIST * (svgPoint.x - margin.left)) /
            (width - margin.left - margin.right);
        const newY =
            (-Y_DIST * (svgPoint.y - HEIGHT + margin.bottom)) /
            (HEIGHT - margin.top - margin.bottom);
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

    const handleRightClick = (
        e: React.MouseEvent<Element, MouseEvent>,
        index: number
    ) => {
        e.preventDefault();
        if (index === 0 || index === points.length - 1) {
            return;
        }
        setPoints((old) => old.filter((_, i) => i !== index));
    };

    type RGB = {
        r: number;
        g: number;
        b: number;
    };
    const lerpRGB = (col1: RGB, col2: RGB, t: number) => {
        const res = col1;
        // if (Math.abs(t - 0.5) < deadzone / 2) {
        //     t = 0.5;
        // }
        res.r = Math.round(col1.r + (col2.r - col1.r) * t);
        res.g = Math.round(col1.g + (col2.g - col1.g) * t);
        res.b = Math.round(col1.b + (col2.b - col1.b) * t);

        return res;
    };

    const lerpThreeRGB = (col1: RGB, col2: RGB, col3: RGB, t: number) => {
        if (t <= 0.5) {
            return lerpRGB(col1, col2, t * 2);
        } else {
            return lerpRGB(col2, col3, (t - 0.5) * 2);
        }
    };

    const rgbToHex = (col: RGB) => {
        const toHex = (c: number) => {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };

        return "#" + toHex(col.r) + toHex(col.g) + toHex(col.b);
    };

    return (
        <>
            <div className="-mt-3">
                <Tooltip
                    content={
                        <div className="pr-6 pl-2 text-left flex">
                            <div className="flex flex-col w-40">
                                <div className="my-1">
                                    <img
                                        className="inline-block"
                                        src="/circa/lmb.svg"
                                        height={20}
                                        width={20}
                                    />
                                    <b className="font-semibold">+ Drag</b>
                                </div>
                                <div className="my-1">
                                    <img
                                        className="inline-block"
                                        src="/circa/lmb.svg"
                                        height={20}
                                        width={20}
                                    />
                                    <img
                                        className="inline-block"
                                        src="/circa/lmb.svg"
                                        height={20}
                                        width={20}
                                    />
                                    <b className="font-semibold"> (Double Click)</b>
                                </div>
                                <div className="my-1">
                                    <img
                                        className="inline-block"
                                        src="/circa/rmb.svg"
                                        height={20}
                                        width={20}
                                    />
                                    <b className="font-semibold"> (Right Click)</b>
                                </div>
                            </div>
                            <div className="flex flex-col w-24">
                                <div className="my-[14px] mt-[16px]">
                                    <hr className="w-16" />
                                </div>
                                <div className="my-[15px]">
                                    <hr className="w-16" />
                                </div>
                                <div className="my-[14px]">
                                    <hr className="w-16" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="ml-7 my-[5px] font-semibold">Move</div>
                                <div className="ml-7 my-[5px] font-semibold">Add</div>
                                <div className="ml-7 my-[5px] font-semibold">Remove</div>
                            </div>
                            {/* <div className="m-1 flex">
                            <img className='inline-block' src='public/lmb.svg' height={20} width={20} /> 
                            <b className="font-semibold">+ Drag</b>: move points
                        </div>
                        <div className="m-1 flex">
                            <img className='inline-block' src='public/lmb.svg' height={20} width={20} /> 
                            <img className='inline-block' src='public/lmb.svg' height={20} width={20} />: Add point
                        </div>
                        <div className="m-1 flex">
                            <img className='inline-block' src='public/rmb.svg' height={20} width={20} />: Remove point
                        </div> */}
                        </div>
                    }
                >
                    <Button
                        variant="outline"
                        className="select-none flex justify-center items-center align-middle rounded-md  px-2 py-1"
                    >
                        Instructions
                        <CircleHelp />
                    </Button>
                </Tooltip>
            </div>

            <div className="select-none" onDoubleClick={handleDoubleClick}>
                <XYChart
                    height={HEIGHT}
                    width={width}
                    xScale={{ type: "linear", domain: X_RANGE }}
                    yScale={{ type: "linear", domain: Y_RANGE }}
                    captureEvents={false}
                >
                    <defs>
                        <filter id="glow" x="-200%" y="-200%" width="600%" height="600%">
                            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <Axis orientation="bottom" label="Time of Day" />
                    <Axis orientation="left" label="Energy Level" />

                    <AnimatedLineSeries
                        dataKey="AvgLine"
                        data={averagePoints}
                        {...accessors}
                        curve={curveMonotoneX}
                    />

                    <AnimatedLineSeries
                        dataKey="Line"
                        data={points}
                        {...accessors}
                        curve={curveMonotoneX}
                    />

                    {points.map((point, i) => (
                        <Drag
                            key={i}
                            x={point.x}
                            y={point.y}
                            width={width}
                            height={HEIGHT}
                            onDragMove={({ x, y, dx, dy }) =>
                                updatePoint(i, x, y, dx, dy, false, true)
                            }
                            onDragEnd={({ x, y, dx, dy }) =>
                                updatePoint(i, x, y, dx, dy, true, true)
                            }
                            captureDragArea
                            restrict={{
                                xMin: 0,
                                xMax: width,
                                yMin: 0,
                                yMax: HEIGHT,
                            }}
                        >
                            {({ dragStart, dragEnd, dragMove, isDragging, dx, dy }) => {
                                if (isDragging) {
                                    dx = (dx * X_DIST) / (width - margin.left - margin.right);
                                    dy = (dy * Y_DIST) / (HEIGHT - margin.top - margin.bottom);
                                } else {
                                    dx = 0;
                                    dy = 0;
                                }
                                if (!wasDragging.current && isDragging) {
                                    dragOffset.current = { x: dx, y: dy };
                                }
                                const newX =
                                    point.x + dx - (isDragging ? dragOffset.current.x : 0);
                                const newY =
                                    point.y - dy + (isDragging ? dragOffset.current.y : 0);
                                const xPos =
                                    (newX / X_DIST) * (width - margin.left - margin.right) +
                                    margin.left;
                                const yPos =
                                    HEIGHT -
                                    margin.bottom -
                                    (newY * (HEIGHT - margin.top - margin.bottom)) / Y_DIST;

                                if (isDragging) {
                                    wasDragging.current = isDragging;
                                }

                                return (
                                    <Circle
                                        key={`dot-${i}`}
                                        cx={xPos}
                                        cy={yPos}
                                        r={isDragging ? 8 : currentHoverIndex === i ? 8 : 6}
                                        // fill={isDragging ? 'blue' : 'blue'}
                                        fill={rgbToHex(
                                            lerpThreeRGB(
                                                { r: 162, g: 215, b: 216 },
                                                { r: 180, g: 177, b: 171 },
                                                { r: 222, g: 88, b: 66 },
                                                newY / Y_DIST
                                            )
                                        )}
                                        onMouseMove={dragMove}
                                        onMouseUp={dragEnd}
                                        onContextMenu={(e) => {
                                            handleRightClick(e, i);
                                        }}
                                        onMouseDown={dragStart}
                                        onTouchStart={dragStart}
                                        onTouchMove={dragMove}
                                        onTouchEnd={dragEnd}
                                        onMouseEnter={() => setCurrentHoverIndex(i)}
                                        onMouseLeave={() => setCurrentHoverIndex(null)}
                                        // style={{ transition: 'fill 0.1s ease-in-out' }}
                                        filter="url(#glow)"
                                    ></Circle>
                                );
                            }}
                        </Drag>
                    ))}
                </XYChart>
            </div>
            <Button
                variant="default"
                className="rounded-md px-2 cursor-pointer mt-3 w-50"
                // style={{ fontFamily: "Jacques Francois" }}
                onClick={() => {
                    uploadPointsToDB();
                }}
            >
                UPLOAD
            </Button>
        </>
    );
}

export default Plot;

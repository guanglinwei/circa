import { useState } from "react";
import { Axis, LineSeries, XYChart } from "@visx/xychart";
import { Drag } from "@visx/drag";
import { Circle } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";

type Point = { x: number; y: number; };

const WIDTH = 800;
const HEIGHT = 400;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

function Plot() {
    // const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
    const [points, setPoints] = useState<Point[]>([
        { x: 2, y: 2 },
        { x: 6, y: 5 },
        { x: 10, y: 3 },
        { x: 20, y: 8 },
    ]);

    // 0, 0 | 24, 10 --> 50, 350 | 750, 50
    const updatePoint = (index: number, x: number, y: number, dx: number, dy: number, final: boolean = true) => {
        const newX = 24 * (x + dx - margin.left) / (WIDTH - margin.left - margin.right);
        const newY = -10 * (y + dy - HEIGHT + margin.bottom) / (HEIGHT - margin.top - margin.bottom);
        let clampedX = Math.max(0, Math.min(24, newX));
        let clampedY = Math.max(0, Math.min(10, newY));
        if (final) {
            clampedX = Math.round(clampedX);
            clampedY = Math.round(clampedY);
        }
        const updated = [...points];
        updated[index] = { x: Math.round(clampedX), y: Math.round(clampedY) };
        if (final) {
            updated.sort((a, b) => a.x - b.x);
            setPoints(updated);
        }
    };

    const accessors = {
        xAccessor: (d: Point) => d.x,
        yAccessor: (d: Point) => d.y,
    };


    return (
        <div className='select-none'>
            <button onClick={() => {
                console.log(points)
            }}>print State</button>
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
                        onDragMove={({ x, y, dx, dy }) => updatePoint(i, x || 0, y || 0, dx, dy, false)}
                        onDragEnd={({ x, y, dx, dy }) => updatePoint(i, x || 0, y || 0, dx, dy, true)}
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
                            const newX = point.x + dx;
                            const newY = point.y - dy;
                            const xPos = (newX / 24) * (WIDTH - margin.left - margin.right) + margin.left;
                            const yPos = HEIGHT - margin.bottom - newY * (HEIGHT - margin.top - margin.bottom) / 10;

                            return (
                                <Circle
                                    key={`dot-${i}`}
                                    cx={xPos}
                                    cy={yPos}
                                    r={isDragging ? 8 : 6}
                                    fill={isDragging ? 'orange' : 'red'}
                                    onMouseMove={dragMove}
                                    onMouseUp={dragEnd}
                                    onMouseDown={dragStart}
                                    onTouchStart={dragStart}
                                    onTouchMove={dragMove}
                                    onTouchEnd={dragEnd}
                                />
                            );
                        }}
                    </Drag>
                ))}

                {/* {points.map((point, i) => {
                    const dx = 0;
                    const dy = 0
                    const isDragging = false;
                    const newX = point.x + dx;
                    const newY = point.y + dy;
                    const xPos = (newX / 24) * (WIDTH - margin.left - margin.right) + margin.left;
                    const yPos = HEIGHT - margin.bottom - newY * (HEIGHT - margin.top - margin.bottom) / 10;

                    return (
                        <Circle
                            key={`dot-${i}`}
                            cx={xPos}
                            cy={yPos}
                            r={isDragging ? 8 : 6}
                            fill={isDragging ? 'orange' : 'red'}
                            // onMouseMove={dragMove}
                            // onMouseUp={dragEnd}
                            onMouseDown={(e) => { console.log('asdfasdf');}}
                            onClick={()=>console.log('clicks')}
                            // onTouchStart={dragStart}
                            // onTouchMove={dragMove}
                            // onTouchEnd={dragEnd}
                        />
                    );
                })} */}
            </XYChart>
        </div>
    );
}

export default Plot;


import { memo, useEffect, useRef } from "react";

interface Point {
    x: number;
    y: number;
}

interface Branch {
    start: Point;
    length: number;
    angle: number;
}

const {random} = Math;

const randomNumber = (min = 0, max = 1) => {
    return random() * (max - min) + min;
};

export const Plum = memo(() => {
    const WIDTH = 500,
        HEIGHT = 500;
    const el = useRef<HTMLCanvasElement>(null);
    let ctx: CanvasRenderingContext2D;

    useEffect(() => {
        ctx = el.current?.getContext("2d") as CanvasRenderingContext2D;
        init();
    });

    const init = () => {
        ctx.strokeStyle = "black";
        let branch: Branch = {
            start: {
                x: randomNumber(0, WIDTH),
                y: HEIGHT,
            },
            length: random() * 26,
            angle: -Math.PI / 2,
        };

        if (random() < 0.5) {
            branch = {
                start: {
                    x: randomNumber(0, WIDTH),
                    y: 0,
                },
                length: random() * 26 + 10,
                angle: Math.PI / 2,
            };
        }

        step(branch);
    };

    // eslint-disable-next-line @typescript-eslint/ban-types
    const pendingTasks: Function[] = [];

    const step = (branch: Branch, depth = 0) => {
        const end = getEndPoint(branch);
        drawLine(branch);
        if (
            branch.start.x > WIDTH ||
            branch.start.x < 0 ||
            branch.start.y > HEIGHT ||
            branch.start.y < 0
        ) {
            return;
        }

        if (depth < 4 || random() > 0.5) {
            pendingTasks.push(() =>
                step(
                    {
                        start: end,
                        length: branch.length + (random() * 2 - 1),
                        angle: branch.angle - 0.2,
                    },
                    depth + 1
                )
            );
        }

        if (depth < 4 || random() > 0.5) {
            pendingTasks.push(() =>
                step(
                    {
                        start: end,
                        length: branch.length + (random() * 2 - 1),
                        angle: branch.angle + 0.2,
                    },
                    depth + 1
                )
            );
        }
    };

    const frame = () => {
        const tasks = [...pendingTasks];
        pendingTasks.length = 0;
        tasks.forEach((task) => task());
    };

    let framesCount = 0;

    function startFrame() {
        requestAnimationFrame(() => {
            framesCount += 1;
            if (framesCount % 3 === 0) frame();
            startFrame();
        });
    }

    startFrame();

    const lineTo = (p1: Point, p2: Point) => {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    };

    const getEndPoint = (b: Branch) => ({
        x: b.start.x + b.length * Math.cos(b.angle),
        y: b.start.y + b.length * Math.sin(b.angle),
    });

    const drawLine = (b: Branch) => {
        lineTo(b.start, getEndPoint(b));
    };

    return (
        <div>
            <h1>Hello Bifurcate tree</h1>
            <canvas
                ref={el}
                width={WIDTH}
                height={HEIGHT}
                style={{
                    border: "1px solid black",
                }}
            ></canvas>
        </div>
    );
});
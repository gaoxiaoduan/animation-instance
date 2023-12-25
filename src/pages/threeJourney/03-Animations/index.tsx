import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
// import gsap from "gsap";

/**
 * 动画
 * 1.requestAnimationsFrame
 * 2.clock
 * 3.递增值
 * 5.相机的lookAt
 * 6.sin & cos
 * 7.GSAP - npm i gsap
 */
export const Animations: FC = () => {
    // let count = 1;

    const webgl = useRef(null);
    // 创建场景
    const scene = new THREE.Scene();

    // 创建组
    const group = new THREE.Group();
    scene.add(group);

    const cube1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({color: 0xff0000})
    );
    group.add(cube1);

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);


    const sizes = {
        width: 800,
        height: 600
    };

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(0, 1, 3);
    camera.lookAt(group.position);
    scene.add(camera);
    const clock = new THREE.Clock();

    useEffect(() => {
        // 创建渲染器
        const canvas = webgl.current! as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({
            canvas
        });

        renderer.setSize(sizes.width, sizes.height);
        renderer.render(scene, camera);

        // gsap.to(group.position, {
        //     duration: 1, // 动画持续时间
        //     delay: 1, // 延迟时间
        //     x: 2, // 动画结束时的值
        // });

        const tick = () => {
            // 经过的时间-秒 -> 递增值
            const elapsedTime = clock.getElapsedTime();

            // group.position.y = Math.sin(elapsedTime);
            // group.position.x = Math.cos(elapsedTime);

            camera.position.y = Math.sin(elapsedTime);
            camera.position.x = Math.cos(elapsedTime);
            camera.lookAt(group.position);


            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

    return <>
        <h2>Animations</h2>
        <canvas ref={webgl}></canvas>
    </>;
};
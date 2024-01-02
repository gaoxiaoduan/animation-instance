import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { Points, PointsMaterial } from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometry } from "three/src/core/BufferGeometry";


/**
 * 银河生成器
 */
export const GalaxyGenerator: FC = () => {
    /**
     * TextureLoader
     */
    // const textureLoader = new THREE.TextureLoader();


    /**
     * gui
     */
    const gui = new dat.GUI({autoPlace: false, width: 400});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const webgl = useRef(null);

    /**
     * 场景
     */
    const scene = new THREE.Scene();

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.visible = false;
    scene.add(axesHelper);
    gui.add(axesHelper, "visible").name("axesHelper");

    /**
     * Galaxy
     */
    let geometry: BufferGeometry | null = null;
    let material: PointsMaterial | null = null;
    let points: Points | null = null;

    const params = {
        count: 100000, // 点的数量
        size: 0.01, // 点的大小
        radius: 6, // 点的半径
        branches: 3, // 分支数量
        spin: 1, // 旋转速度
        randomness: 0.2, // 随机性
        randomnessPower: 3, // 随机性强度
        colorInside: "#ff6030",
        colorOutside: "#1b3984",
    };

    const generateGalaxy = () => {
        /**
         * 清除
         */
        if (points !== null) {
            geometry?.dispose();
            material?.dispose();
            scene.remove(points);
        }

        /**
         * 几何体
         */
        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(params.count * 3);
        const colors = new Float32Array(params.count * 3);

        for (let i = 0; i < params.count; i++) {
            const i3 = i * 3;

            // position
            const radius = Math.random() * params.radius;
            const spinAngle = radius * params.spin;
            // 分支角度
            const branchAngel = (i % params.branches) / params.branches * Math.PI * 2;

            // 缩放距离轴
            const distanceFormAxisScaled = (Math.random() - 0.5) * radius * params.randomness * (Math.random() < 0 ? -1 : 1);
            const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0 ? -1 : 1);
            const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0 ? -1 : 1) + distanceFormAxisScaled;
            const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0 ? -1 : 1);

            positions[i3] = Math.cos(branchAngel + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngel + spinAngle) * radius + randomZ;

            // color
            const mixedColor = new THREE.Color();
            mixedColor.set(params.colorInside);
            mixedColor.lerp(new THREE.Color(params.colorOutside), radius / params.radius);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        /**
         * 材质
         */
        material = new THREE.PointsMaterial({
            size: params.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        });

        /**
         * 点
         */
        points = new THREE.Points(geometry, material);
        scene.add(points);
    };
    generateGalaxy();

    gui.add(params, "count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
    gui.add(params, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
    gui.add(params, "radius").min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
    gui.add(params, "branches").min(2).max(20).step(1).onFinishChange(generateGalaxy);
    gui.add(params, "spin").min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
    gui.add(params, "randomness").min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
    gui.add(params, "randomnessPower").min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
    gui.addColor(params, "colorInside").onFinishChange(generateGalaxy);
    gui.addColor(params, "colorOutside").onFinishChange(generateGalaxy);


    const sizes = {
        width: 800,
        height: 600
    };

    /**
     * 相机
     */
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(3, 4, 5);
    scene.add(camera);


    useEffect(() => {
        const webglWarp = document.querySelector(".webgl_warp") as HTMLDivElement;
        webglWarp.appendChild(gui.domElement);
        // 更新渲染器尺寸
        sizes.width = webglWarp.clientWidth;
        sizes.height = webglWarp.clientHeight;
        // 更新相机
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();


        /**
         * 渲染器
         */
        const canvas = webgl.current! as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({
            canvas
        });
        renderer.setSize(sizes.width, sizes.height);
        // 设置像素比 当像素比超过2，人眼分辨不出，但是会增加性能开销，所以取最小值
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderer.render(scene, camera);

        // 控制器
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true; // 阻尼效果


        /**
         * 动画
         */
            // const clock = new THREE.Clock();
        const tick = () => {
                // const elapsedTime = clock.getElapsedTime();


                // 更新控制器
                controls.update();

                renderer.render(scene, camera);
                requestAnimationFrame(tick);
            };
        requestAnimationFrame(tick);

        const handleResize = () => {
            // 更新渲染器尺寸
            sizes.width = webglWarp.clientWidth;
            sizes.height = webglWarp.clientHeight;
            // 更新相机
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();
            // 更新渲染器
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });


    return <>
        <h2>GalaxyGenerator</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
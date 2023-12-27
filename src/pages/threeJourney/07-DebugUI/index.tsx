import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import gsap from "gsap";


/**
 * 调试UI
 */
export const DebugUI: FC = () => {
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const params = {
        color: 0xff0000,
        spin: () => {
            gsap.to(cube1.rotation, {duration: 1, y: cube1.rotation.y + Math.PI * 2});
        }
    };
    gui.addColor(params, "color").onChange(() => {
        cube1.material.color.set(params.color);
    });
    gui.add(params, "spin");

    const webgl = useRef(null);

    // 创建场景
    const scene = new THREE.Scene();

    // 创建组
    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.BufferGeometry();
    const count = 30;
    const positionsArray = new Float32Array(count * 3 * 3);
    for (let i = 0; i < count * 3 * 3; i++) {
        positionsArray[i] = Math.random();
    }

    const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
    geometry.setAttribute("position", positionsAttribute);

    // const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2),
    const cube1 = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({color: params.color, wireframe: true})
    );
    group.add(cube1);
    gui.add(cube1.position, "x", -3, 3, 0.01);
    gui.add(cube1.position, "y", -3, 3, 0.01);
    gui.add(cube1.position, "z", -3, 3, 0.01);
    gui.add(cube1, "visible").name("cube1 visible");
    gui.add(cube1.material, "wireframe").name("cube1 wireframe");

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);


    const sizes = {
        width: 800,
        height: 600
    };

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(0, 0, 3);
    camera.lookAt(group.position);
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

        // 创建渲染器
        const canvas = webgl.current! as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({
            canvas
        });


        renderer.setSize(sizes.width, sizes.height);
        renderer.render(scene, camera);
        // 设置像素比 当像素比超过2，人眼分辨不出，但是会增加性能开销，所以取最小值
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 控制器
        const controls = new OrbitControls(camera, canvas);
        // controls.enabled = false;
        controls.enableDamping = true; // 阻尼效果

        const tick = () => {
            // 更新控制器
            controls.update();

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        const handleFullscreen = () => {
            // 有兼容性问题
            if (!document.fullscreenElement) {
                canvas.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        };

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
        canvas.addEventListener("dblclick", handleFullscreen);

        return () => {
            window.removeEventListener("resize", handleResize);
            canvas.removeEventListener("dblclick", handleFullscreen);
        };
    });


    return <>
        <h2>DebugUI</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
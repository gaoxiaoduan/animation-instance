import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import HELVETIKER_REGULAR from "@/assets/font/helvetiker_regular.typeface.json";
import MatcapTexture from "@/assets/textures/matcaps/8.png";


/**
 * 3D 文字
 */
export const Text3D: FC = () => {
    const matcapTexture = new THREE.TextureLoader().load(MatcapTexture);
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const webgl = useRef(null);
    // 创建场景
    const scene = new THREE.Scene();

    // // 辅助坐标系
    // const axesHelper = new THREE.AxesHelper(3);
    // scene.add(axesHelper);

    // 创建文字
    const fontLoader = new FontLoader();
    const font = fontLoader.parse(HELVETIKER_REGULAR);
    const textGeometry = new TextGeometry("Hello Three.js", {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    textGeometry.center();
    const material = new THREE.MeshMatcapMaterial({
        matcap: matcapTexture
    });
    const text = new THREE.Mesh(textGeometry, material);
    scene.add(text);

    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);

    for (let i = 0; i < 500; i++) {
        const donut = new THREE.Mesh(donutGeometry, material);
        donut.position.x = (Math.random() - 0.5) * 20;
        donut.position.y = (Math.random() - 0.5) * 20;
        donut.position.z = (Math.random() - 0.5) * 20;
        donut.rotation.x = Math.random() * Math.PI;
        donut.rotation.y = Math.random() * Math.PI;
        const scale = Math.random();
        donut.scale.set(scale, scale, scale);
        scene.add(donut);
    }


    const sizes = {
        width: 800,
        height: 600
    };
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(0, 0, 3);
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
        controls.enableDamping = true; // 阻尼效果


        const tick = () => {
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
        <h2>3D Text</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
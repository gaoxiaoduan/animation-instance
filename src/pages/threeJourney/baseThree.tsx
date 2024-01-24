import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


/**
 * 基础模版
 */
export const BaseThree: FC = () => {
    // /**
    //  * 纹理加载器
    //  */
    // const textureLoader = new THREE.TextureLoader();


    /**
     * gui
     */
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const webgl = useRef<HTMLCanvasElement>(null);
    const webglWarp = useRef<HTMLDivElement>(null);

    /**
     * 场景
     */
    const scene = new THREE.Scene();

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    // axesHelper.visible = false;
    scene.add(axesHelper);
    gui.add(axesHelper, "visible").name("axesHelper");

    /**
     * 测试
     */
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial(),
    );
    scene.add(cube);


    const sizes = {
        width: 800,
        height: 600
    };

    /**
     * 相机
     */
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(3, 4, 5);
    scene.add(camera);

    /**
     * 渲染器
     */
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    /**
     * 控制器
     */
    const controlsRef = useRef<OrbitControls | null>(null);


    // 初始化
    useEffect(() => {
        const webglWarpElement = webglWarp.current!;
        webglWarpElement.appendChild(gui.domElement);
        // 更新渲染器尺寸
        sizes.width = webglWarpElement.clientWidth;
        sizes.height = webglWarpElement.clientHeight;
        // 更新相机
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        const canvas = webgl.current!;

        // 渲染器
        const renderer = new THREE.WebGLRenderer({
            canvas,
        });

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderer.render(scene, camera);
        rendererRef.current = renderer;

        controlsRef.current = new OrbitControls(camera, canvas);
        controlsRef.current.enableDamping = true; // 阻尼效果

        const handleResize = () => {
            // 更新渲染器尺寸
            sizes.width = webglWarpElement.clientWidth;
            sizes.height = webglWarpElement.clientHeight;
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
    }, []);


    // /**
    //  * 动画
    //  */
    // const clock = new THREE.Clock();
    const tick = () => {
        // const elapsedTime = clock.getElapsedTime();

        // 更新控制器
        controlsRef.current?.update();

        rendererRef.current?.render(scene, camera);
        requestAnimationFrame(tick);
    };
    tick();


    return <div className="webgl_warp h-full relative" ref={webglWarp}>
        <canvas className=".webgl" ref={webgl}></canvas>
    </div>;
};
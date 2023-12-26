import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


/**
 * 全屏和自适应
 * 1. 通过监听 window 的 resize 事件，更新渲染器尺寸
 * 2. 更新 camera.aspect
 * 3. 更新 camera.updateProjectionMatrix();
 * 4. renderer.setPixelRatio(window.devicePixelRatio);
 * 5. 全屏
 */
export const FullscreenAndResizing: FC = () => {
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

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(0, 0, 3);
    camera.lookAt(group.position);
    scene.add(camera);

    useEffect(() => {
        const webglWarp = document.querySelector(".webgl_warp") as HTMLDivElement;

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
        <h2>FullscreenAndResizing:Double click to enter full screen</h2>
        <div className="flex-1 webgl_warp">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
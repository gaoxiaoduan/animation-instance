import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


/**
 * 相机
 * 1. 透视相机
 * 2. 正交相机
 * 3. 控制器
 */
export const Cameras: FC = () => {
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
    // fov: 视野范围(垂直方向)
    // aspect: 长宽比
    // near: 近平面
    // far: 远平面
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(0, 0, 3);
    camera.lookAt(group.position);
    scene.add(camera);

    useEffect(() => {
        // 创建渲染器
        const canvas = webgl.current! as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({
            canvas
        });

        renderer.setSize(sizes.width, sizes.height);
        renderer.render(scene, camera);


        // 鼠标移动，控制相机位置
        // const cursor = {
        //     x: 0,
        //     y: 0,
        // };
        // canvas.addEventListener("mousemove", (event) => {
        //     // 将鼠标移动范围转换成 [-0.5,0.5]
        //     cursor.x = event.offsetX / sizes.width - 0.5;
        //     cursor.y = -(event.offsetY / sizes.height - 0.5);
        // });

        // 控制器
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true; // 阻尼效果

        const tick = () => {
            // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2;
            // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2;
            // camera.position.y = cursor.y * 3;
            // camera.lookAt(group.position);

            // 更新控制器
            controls.update();

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });


    return <>
        <h2>Cameras</h2>
        <canvas ref={webgl}></canvas>
    </>;
};
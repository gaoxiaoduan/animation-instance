import { FC, useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 基础场景
 * 1.创建场景
 * 2.创建几何体
 * 3.创建材质
 * 4.创建网格模型
 * 5.将网格模型添加到场景中
 * 6.创建相机
 * 7.创建渲染器
 * 8.渲染
 */
export const BasicScene: FC = () => {
    const webgl = useRef(null);
    // 创建场景
    const scene = new THREE.Scene();

    // 创建几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // 创建材质
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});

    // 创建网格模型
    const mesh = new THREE.Mesh(geometry, material);

    // 将网格模型添加到场景中
    scene.add(mesh);

    const sizes = {
        width: 800,
        height: 600
    };
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;
    scene.add(camera);

    useEffect(() => {
        // 创建渲染器
        const canvas = webgl.current! as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({
            canvas
        });

        renderer.setSize(sizes.width, sizes.height);
        renderer.render(scene, camera);
    });


    return <>
        <h2>BasicScene</h2>
        <canvas ref={webgl}></canvas>
    </>;
};
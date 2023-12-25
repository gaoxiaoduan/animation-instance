import { FC, useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 变换对象
 * 1.position
 * 2.scale
 * 3.rotation
 * 4.组
 */
export const TransformObjects: FC = () => {
    const webgl = useRef(null);
    // 创建场景
    const scene = new THREE.Scene();

    // // 创建几何体
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // // 创建材质
    // const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    //
    // // 创建网格模型
    // const mesh = new THREE.Mesh(geometry, material);
    //
    // // position属性
    // mesh.position.set(1, 0.3, -1);
    //
    // // scale属性
    // mesh.scale.set(2, 0.5, 0.5);
    //
    // // rotation属性
    // mesh.rotation.set(0, 0, Math.PI / 4);
    //
    // // 将网格模型添加到场景中
    // scene.add(mesh);

    // 创建组
    const group = new THREE.Group();
    group.position.y = 1;
    group.scale.y = 2;
    group.rotation.y = Math.PI / 3;
    scene.add(group);

    const cube1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({color: 0xff0000})
    );
    group.add(cube1);

    const cube2 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({color: 0x00ff00})
    );
    cube2.position.x = -2;
    group.add(cube2);

    const cube3 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({color: 0x0000ff})
    );
    cube3.position.x = 2;
    group.add(cube3);


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
        <h2>TransformObjects</h2>
        <canvas ref={webgl}></canvas>
    </>;
};
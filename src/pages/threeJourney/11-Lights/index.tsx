import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";

/**
 * 灯光
 * 环境光
 * 点光源
 * 方向光
 * 半球光
 * 矩形区域光
 * 聚光灯
 * 辅助坐标系
 */
export const Lights: FC = () => {
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const webgl = useRef(null);
    // 创建场景
    const scene = new THREE.Scene();

    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 点光源
    const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2);
    pointLight.position.set(1, -0.5, 1);
    scene.add(pointLight);

    // 方向光 模拟太阳光
    const directionalLight = new THREE.DirectionalLight(0xffcc00, 0.1);
    directionalLight.position.set(0.25, 3, 0);
    scene.add(directionalLight);

    // 半球光 有点像 有上下两个直线光，照射同一个物体
    const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
    scene.add(hemisphereLight);

    // 矩形区域光 有点像摄影棚的补光灯
    const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
    rectAreaLight.position.set(-1.5, 0, 1.5);
    rectAreaLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(rectAreaLight);

    // 聚光灯 有点像手电筒
    const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1);
    spotLight.position.set(0, 2, 3);
    scene.add(spotLight);
    spotLight.target.position.set(-0.3, 0, 0);
    scene.add(spotLight.target);

    gui.add(spotLight.position, "x").min(-5).max(5).step(0.01).name("spotLightX");
    gui.add(spotLight.position, "y").min(-5).max(5).step(0.01).name("spotLightY");


    const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
    scene.add(pointLightHelper);

    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
    scene.add(directionalLightHelper);

    const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
    scene.add(hemisphereLightHelper);

    const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
    scene.add(rectAreaLightHelper);

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);

    gui.add(pointLightHelper, "visible").name("pointLightHelper");
    gui.add(directionalLightHelper, "visible").name("directionalLightHelper");
    gui.add(hemisphereLightHelper, "visible").name("hemisphereLightHelper");
    gui.add(rectAreaLightHelper, "visible").name("rectAreaLightHelper");
    gui.add(spotLightHelper, "visible").name("spotLightHelper");


    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.4;

    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        material
    );
    sphere.position.x = -1.5;

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.75, 0.75),
        material
    );

    const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.2, 32, 64),
        material
    );
    torus.position.x = 1.5;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 5),
        material
    );
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.65;

    scene.add(sphere, cube, torus, plane);

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);
    gui.add(axesHelper, "visible").name("axesHelper");

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
        <h2>Lights</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
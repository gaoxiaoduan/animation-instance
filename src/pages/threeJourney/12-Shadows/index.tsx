import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SimpleShadow from "@/assets/textures/shadows/simpleShadow.jpg";


/**
 * 阴影
 */
export const Shadows: FC = () => {
    const textureLoader = new THREE.TextureLoader();
    const simpleShadow = textureLoader.load(SimpleShadow);

    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const webgl = useRef(null);
    // 创建场景
    const scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
    scene.add(ambientLight);

    // directionalLight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(2, 2, -1);
    gui.add(directionalLight, "intensity").min(0).max(1).step(0.001);
    gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
    gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
    gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);

    directionalLight.castShadow = false;
    directionalLight.shadow.mapSize.set(1024 * 2, 1024 * 2);
    directionalLight.shadow.camera.top = 1;
    directionalLight.shadow.camera.right = 1;
    directionalLight.shadow.camera.bottom = -1;
    directionalLight.shadow.camera.left = -1;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 6;

    const directionCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    directionCameraHelper.visible = false;
    scene.add(directionCameraHelper);
    scene.add(directionalLight);
    gui.add(directionCameraHelper, "visible").name("directionCameraHelper");
    gui.add(directionalLight, "castShadow").name("directionalLightCastShadow");

    // spotLight
    const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
    spotLight.castShadow = false;
    spotLight.position.set(0, 2, 2);
    spotLight.shadow.mapSize.set(1024 * 2, 1024 * 2);
    spotLight.shadow.camera.fov = 30;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 6;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
    spotLightCameraHelper.visible = false;
    scene.add(spotLightCameraHelper);
    gui.add(spotLightCameraHelper, "visible").name("spotLightCameraHelper");
    gui.add(spotLight, "castShadow").name("spotLightCastShadow");

    // point light
    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.castShadow = false;
    pointLight.position.set(-2, 2, 0);
    pointLight.shadow.mapSize.set(1024 * 2, 1024 * 2);
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 5;
    scene.add(pointLight);

    const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
    pointLightCameraHelper.visible = false;
    scene.add(pointLightCameraHelper);
    gui.add(pointLightCameraHelper, "visible").name("pointLightCameraHelper");
    gui.add(pointLight, "castShadow").name("pointLightCastShadow");


    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.5;
    gui.add(material, "metalness").min(0).max(1).step(0.001);
    gui.add(material, "roughness").min(0).max(1).step(0.001);

    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        material
    );
    sphere.castShadow = false;
    gui.add(sphere, "castShadow").name("sphereCastShadow");

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8),
        material
    );
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.5;
    plane.receiveShadow = true;
    scene.add(sphere, plane);

    // simpleShadow
    const planeShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            alphaMap: simpleShadow
        })
    );
    planeShadow.rotation.x = -Math.PI * 0.5;
    planeShadow.position.y = plane.position.y + 0.01;
    scene.add(planeShadow);

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.visible = false;
    scene.add(axesHelper);
    gui.add(axesHelper, "visible").name("axesHelper");

    const sizes = {
        width: 800,
        height: 600
    };
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(1, 1, 5);
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
        renderer.shadowMap.enabled = false;
        gui.add(renderer.shadowMap, "enabled").name("shadowMapEnabled");
        renderer.setSize(sizes.width, sizes.height);
        renderer.render(scene, camera);
        // 设置像素比 当像素比超过2，人眼分辨不出，但是会增加性能开销，所以取最小值
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 控制器
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true; // 阻尼效果


        const clock = new THREE.Clock();
        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            sphere.position.x = Math.sin(elapsedTime) * 3;
            sphere.position.z = Math.cos(elapsedTime) * 3;
            sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));


            planeShadow.position.x = sphere.position.x;
            planeShadow.position.z = sphere.position.z;
            planeShadow.material.opacity = (1 - sphere.position.y) * 0.4;

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
        <h2>Shadows</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
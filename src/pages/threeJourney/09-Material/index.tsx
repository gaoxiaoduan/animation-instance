import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import DoorColorTexture from "@/assets/textures/door/color.jpg";
import DoorAlphaTexture from "@/assets/textures/door/alpha.jpg";
import DoorAmbientOcclusionTexture from "@/assets/textures/door/ambientOcclusion.jpg";
import DoorHeightTexture from "@/assets/textures/door/height.jpg";
import DoorNormalTexture from "@/assets/textures/door/normal.jpg";
import DoorMetalnessTexture from "@/assets/textures/door/metalness.jpg";
import DoorRoughnessTexture from "@/assets/textures/door/roughness.jpg";
// import MatcapTexture from "@/assets/textures/matcaps/1.png";
// import GradientTexture from "@/assets/textures/gradients/3.jpg";
import Px from "@/assets/textures/environmentMaps/1/px.jpg";
import Nx from "@/assets/textures/environmentMaps/1/nx.jpg";
import Py from "@/assets/textures/environmentMaps/1/py.jpg";
import Ny from "@/assets/textures/environmentMaps/1/ny.jpg";
import Pz from "@/assets/textures/environmentMaps/1/pz.jpg";
import Nz from "@/assets/textures/environmentMaps/1/nz.jpg";

import * as dat from "dat.gui";


/**
 * 材料
 */
export const Material: FC = () => {
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const textureLoader = new THREE.TextureLoader();
    const doorColorTexture = textureLoader.load(DoorColorTexture);
    const doorAlphaTexture = textureLoader.load(DoorAlphaTexture);
    const doorAmbientOcclusionTexture = textureLoader.load(DoorAmbientOcclusionTexture);
    const doorHeightTexture = textureLoader.load(DoorHeightTexture);
    const doorNormalTexture = textureLoader.load(DoorNormalTexture);
    const doorMetalnessTexture = textureLoader.load(DoorMetalnessTexture);
    const doorRoughnessTexture = textureLoader.load(DoorRoughnessTexture);
    // const matcapTexture = textureLoader.load(MatcapTexture);
    // const gradientTexture = textureLoader.load(GradientTexture);
    const evnMapTexture = cubeTextureLoader.load([Px, Nx, Py, Ny, Pz, Nz]);


    const webgl = useRef(null);


    // const material = new THREE.MeshBasicMaterial({
    //     map: doorColorTexture
    // }); // 基础材质
    // material.transparent = true; // 透明
    // material.alphaMap = doorAlphaTexture; // 透明度贴图
    // material.side = THREE.DoubleSide; // 双面渲染


    // const material = new THREE.MeshNormalMaterial(); // 法线网格材质
    // material.flatShading = true; // 平面着色

    // const material = new THREE.MeshMatcapMaterial();
    // material.matcap = matcapTexture;

    // const material = new THREE.MeshDepthMaterial(); // 深度材质 不受光照影响

    // 一种非光泽表面的材质，没有镜面高光。
    // const material = new THREE.MeshLambertMaterial();

    // const material = new THREE.MeshPhongMaterial(); // 高光材质
    // material.shininess = 100; // 光泽度

    // const material = new THREE.MeshToonMaterial(); // 卡通材质
    // material.gradientMap = gradientTexture; // 渐变贴图

    const material = new THREE.MeshStandardMaterial(); // 标准材质
    material.metalness = 0; // 金属度
    material.roughness = 1; // 粗糙度
    // material.envMap = evnMapTexture; // 环境贴图
    material.map = doorColorTexture; // 颜色贴图
    material.aoMap = doorAmbientOcclusionTexture; // 环境遮挡贴图
    material.aoMapIntensity = 1; // 环境遮挡贴图强度
    material.displacementMap = doorHeightTexture; // 位移贴图
    material.displacementScale = 0.05; // 位移贴图强度
    material.metalnessMap = doorMetalnessTexture; // 金属度贴图
    material.roughnessMap = doorRoughnessTexture; // 粗糙度贴图
    material.normalMap = doorNormalTexture; // 法线贴图
    material.transparent = true; // 透明
    material.alphaMap = doorAlphaTexture; // 透明度贴图
    const folder = gui.addFolder("material");

    folder.add(material, "wireframe").name("wireframe");
    folder.add(material, "metalness").min(0).max(1).step(0.0001).name("metalness");
    folder.add(material, "roughness").min(0).max(1).step(0.0001).name("roughness");
    folder.add(material, "aoMapIntensity").min(0).max(10).step(0.0001).name("aoMapIntensity");
    folder.add(material, "displacementScale").min(0).max(1).step(0.0001).name("displacementScale");
    folder.add(material.normalScale, "x").min(0).max(1).step(0.0001).name("normalScaleX");
    folder.add(material.normalScale, "y").min(0).max(1).step(0.0001).name("normalScaleY");

    const envMaterial = new THREE.MeshStandardMaterial();
    envMaterial.metalness = 1;
    envMaterial.roughness = 0;
    envMaterial.envMap = evnMapTexture;
    const envMaterialGui = gui.addFolder("envMaterial");
    envMaterialGui.add(envMaterial, "metalness").min(0).max(1).step(0.0001).name("metalness");
    envMaterialGui.add(envMaterial, "roughness").min(0).max(1).step(0.0001).name("roughness");

    const group = new THREE.Group();
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
    sphere.position.x = -1.5;
    sphere.geometry.setAttribute("uv2", new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2));

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
    plane.geometry.setAttribute("uv2", new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 64, 128), material);
    torus.position.x = 1.5;
    torus.geometry.setAttribute("uv2", new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2));
    group.add(sphere, plane, torus);

    const group1 = new THREE.Group();
    const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), envMaterial);
    sphere1.position.x = -1.5;
    sphere1.position.y = 1.5;
    const plane1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), envMaterial);
    plane1.position.y = 1.5;
    const torus1 = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 64, 128), envMaterial);
    torus1.position.x = 1.5;
    torus1.position.y = 1.5;
    group1.add(sphere1, plane1, torus1);

    // 创建场景
    const scene = new THREE.Scene();
    scene.add(group, group1);

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);


    const sizes = {
        width: 800,
        height: 600
    };
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(0, 0, 3);
    scene.add(camera);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;
    scene.add(pointLight);

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    scene.add(pointLightHelper);

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


        const clock = new THREE.Clock();
        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            sphere.rotation.y = 0.1 * elapsedTime;
            plane.rotation.y = 0.1 * elapsedTime;
            torus.rotation.y = 0.1 * elapsedTime;

            sphere.rotation.x = 0.15 * elapsedTime;
            plane.rotation.x = 0.15 * elapsedTime;
            torus.rotation.x = 0.15 * elapsedTime;

            sphere1.rotation.y = 0.1 * elapsedTime;
            plane1.rotation.y = 0.1 * elapsedTime;
            torus1.rotation.y = 0.1 * elapsedTime;

            sphere1.rotation.x = 0.15 * elapsedTime;
            plane1.rotation.x = 0.15 * elapsedTime;
            torus1.rotation.x = 0.15 * elapsedTime;


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
        <h2>Material</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import Px from "@/assets/textures/environmentMaps/0/px.jpg";
import Nx from "@/assets/textures/environmentMaps/0/nx.jpg";
import Py from "@/assets/textures/environmentMaps/0/py.jpg";
import Ny from "@/assets/textures/environmentMaps/0/ny.jpg";
import Pz from "@/assets/textures/environmentMaps/0/pz.jpg";
import Nz from "@/assets/textures/environmentMaps/0/nz.jpg";

import FoxGLTF from "@/assets/models/Fox/glTF/Fox.gltf";
import "@/assets/models/Fox/glTF/Fox.bin";
import "@/assets/models/Fox/glTF/Texture.png";

/**
 * 导入模型 GLTF格式
 */
export const ImportedModels: FC = () => {
    /**
     * 纹理加载器
     */
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const environmentMapTexture = cubeTextureLoader.load([Px, Nx, Py, Ny, Pz, Nz]);

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


    let mixer: THREE.AnimationMixer | null = null;
    let action: THREE.AnimationAction | null = null;
    let actions: THREE.AnimationAction[] = [];  // 存储所有的动画动作
    let currentActionIndex = 0;  // 当前播放的动画的索引

    /**
     * 模型加载器
     */
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(FoxGLTF, (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene);
        // 为每一个动画创建一个动作并存储在actions数组中
        for (let i = 0; i < gltf.animations.length; i++) {
            action = mixer.clipAction(gltf.animations[i]);
            actions.push(action);
        }
        actions[currentActionIndex].play();

        gltf.scene.scale.set(0.025, 0.025, 0.025);
        scene.add(gltf.scene);
    });

    const debugObject = {
        isRunning: true,
        animationIndex: currentActionIndex,  // 添加一个控制动画索引的属性
    };

    gui.add(debugObject, "isRunning")
        .name("isRunning")
        .onChange(() => {
            if (debugObject.isRunning) {
                actions[currentActionIndex]?.play();
            } else {
                actions[currentActionIndex]?.stop();
            }
        });

    // 添加一个控制动画索引的滑块
    gui.add(debugObject, "animationIndex", 0, 2, 1)
        .name("Animation")
        .onChange((value) => {
            // 当动画索引改变时，停止当前的动画并播放新的动画
            actions[currentActionIndex]?.stop();
            currentActionIndex = value;
            actions[currentActionIndex]?.play();
        });


    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.visible = false;
    scene.add(axesHelper);
    gui.add(axesHelper, "visible").name("axesHelper");


    /**
     * 地板
     */
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({
            color: "#777777",
            metalness: 0.3,
            roughness: 0.4,
            envMap: environmentMapTexture,
            envMapIntensity: 0.5
        })
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    scene.add(floor);

    /**
     * 灯
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);


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


    /**
     * 动画
     */
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;
    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - oldElapsedTime;
        oldElapsedTime = elapsedTime;

        mixer?.update(deltaTime);

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
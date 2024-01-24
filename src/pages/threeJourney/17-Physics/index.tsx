import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Px from "@/assets/textures/environmentMaps/0/px.jpg";
import Nx from "@/assets/textures/environmentMaps/0/nx.jpg";
import Py from "@/assets/textures/environmentMaps/0/py.jpg";
import Ny from "@/assets/textures/environmentMaps/0/ny.jpg";
import Pz from "@/assets/textures/environmentMaps/0/pz.jpg";
import Nz from "@/assets/textures/environmentMaps/0/nz.jpg";

import Hit from "@/assets/sounds/hit.mp3";

import * as CANNON from "cannon-es";

interface IPosition {
    x: number;
    y: number;
    z: number;
}

/**
 * 物理库
 */
export const Physics: FC = () => {
    /**
     * 纹理加载器
     */
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    const environmentMapTexture = cubeTextureLoader.load([Px, Nx, Py, Ny, Pz, Nz]);

    /**
     * 音效
     */
    const hitSound = new Audio(Hit);
    const playHitSound = (collision: any) => {
        const impactStrength = collision.contact.getImpactVelocityAlongNormal();
        if (impactStrength > 1.5) {
            hitSound.volume = Math.random();
            hitSound.currentTime = 0;
            hitSound.play();
        }
    };

    /**
     * 物理世界
     */
    const world = new CANNON.World();
    world.broadphase = new CANNON.SAPBroadphase(world); // 碰撞检测
    world.allowSleep = true; // 允许睡眠
    world.gravity.set(0, -9.82, 0); // 设置重力

    // 材质
    const defaultMaterial = new CANNON.Material("default"); // 默认
    const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
            friction: 0.1, // 摩擦力
            restitution: 0.7, // 弹性
        }
    );

    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;


    // floor
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
    world.addBody(floorBody);

    /**
     * gui
     */
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const debugObject = {
        createSphere: () => {
            createSphere(Math.random() * 0.5, {
                x: (Math.random() - 0.5) * 3,
                y: 3,
                z: (Math.random() - 0.5) * 3,
            });
        },
        createBox: () => {
            createBox(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                {
                    x: (Math.random() - 0.5) * 3,
                    y: 3,
                    z: (Math.random() - 0.5) * 3,
                }
            );
        },
        reset: () => {
            for (const object of objectsToUpdate) {
                object.body.removeEventListener("collide", playHitSound);
                world.removeBody(object.body);

                scene.remove(object.mesh);
            }
            objectsToUpdate.length = 0;
        }
    };
    gui.add(debugObject, "createSphere");
    gui.add(debugObject, "createBox");
    gui.add(debugObject, "reset");


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
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
     * 工具函数
     */
    const objectsToUpdate: { mesh: THREE.Mesh, body: CANNON.Body }[] = [];

    // 创建球体
    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
    });

    const createSphere = (radius: number, position: IPosition | any) => {
        const mesh = new THREE.Mesh(
            sphereGeometry,
            sphereMaterial,
        );
        mesh.scale.set(radius, radius, radius);
        mesh.castShadow = true;
        mesh.position.copy(position);
        scene.add(mesh);

        // cannon
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: 1,
            shape,
            material: defaultMaterial,
        });
        body.position.copy(position);
        body.addEventListener("collide", playHitSound);
        world.addBody(body);
        // 保存要更新的物体
        objectsToUpdate.push({
            mesh,
            body,
        });
    };
    createSphere(0.5, {x: 0, y: 3, z: 0});

    // 创建盒子
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
    });

    const createBox = (width: number, height: number, depth: number, position: IPosition | any) => {
        const mesh = new THREE.Mesh(
            boxGeometry,
            boxMaterial,
        );
        mesh.scale.set(width, height, depth);
        mesh.castShadow = true;
        mesh.position.copy(position);
        scene.add(mesh);

        // cannon
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 1,
            shape,
            material: defaultMaterial,
        });
        body.position.copy(position);
        body.addEventListener("collide", playHitSound);
        world.addBody(body);
        // 保存要更新的物体
        objectsToUpdate.push({
            mesh,
            body,
        });
    };


    /**
     * 动画
     */
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;
    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - oldElapsedTime;
        oldElapsedTime = elapsedTime;

        // 更新物理世界
        world.step(1 / 60, deltaTime, 3);

        for (const object of objectsToUpdate) {
            object.mesh.position.copy(object.body.position as any);
            object.mesh.quaternion.copy(object.body.quaternion as any);
        }


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
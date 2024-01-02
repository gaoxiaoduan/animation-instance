import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * 门的纹理
 */
import DoorColorTexture from "@/assets/textures/door/color.jpg";
import DoorAlphaTexture from "@/assets/textures/door/alpha.jpg";
import DoorAmbientOcclusionTexture from "@/assets/textures/door/ambientOcclusion.jpg";
import DoorHeightTexture from "@/assets/textures/door/height.jpg";
import DoorNormalTexture from "@/assets/textures/door/normal.jpg";
import DoorMetalnessTexture from "@/assets/textures/door/metalness.jpg";
import DoorRoughnessTexture from "@/assets/textures/door/roughness.jpg";

import BricksColorTexture from "@/assets/textures/bricks/color.jpg";
import BricksAmbientOcclusionTexture from "@/assets/textures/bricks/ambientOcclusion.jpg";
import BricksNormalTexture from "@/assets/textures/bricks/normal.jpg";
import BricksRoughnessTexture from "@/assets/textures/bricks/roughness.jpg";

import GrassColorTexture from "@/assets/textures/grass/color.jpg";
import GrassAmbientOcclusionTexture from "@/assets/textures/grass/ambientOcclusion.jpg";
import GrassNormalTexture from "@/assets/textures/grass/normal.jpg";
import GrassRoughnessTexture from "@/assets/textures/grass/roughness.jpg";

/**
 * HauntedHouse
 */
export const HauntedHouse: FC = () => {
    /**
     * TextureLoader
     */
    const textureLoader = new THREE.TextureLoader();

    const doorColorTexture = textureLoader.load(DoorColorTexture);
    const doorAlphaTexture = textureLoader.load(DoorAlphaTexture);
    const doorAmbientOcclusionTexture = textureLoader.load(DoorAmbientOcclusionTexture);
    const doorHeightTexture = textureLoader.load(DoorHeightTexture);
    const doorNormalTexture = textureLoader.load(DoorNormalTexture);
    const doorMetalnessTexture = textureLoader.load(DoorMetalnessTexture);
    const doorRoughnessTexture = textureLoader.load(DoorRoughnessTexture);

    const bricksColorTexture = textureLoader.load(BricksColorTexture);
    const bricksAmbientOcclusionTexture = textureLoader.load(BricksAmbientOcclusionTexture);
    const bricksNormalTexture = textureLoader.load(BricksNormalTexture);
    const bricksRoughnessTexture = textureLoader.load(BricksRoughnessTexture);

    const grassColorTexture = textureLoader.load(GrassColorTexture);
    const grassAmbientOcclusionTexture = textureLoader.load(GrassAmbientOcclusionTexture);
    const grassNormalTexture = textureLoader.load(GrassNormalTexture);
    const grassRoughnessTexture = textureLoader.load(GrassRoughnessTexture);

    grassColorTexture.repeat.set(8, 8);
    grassAmbientOcclusionTexture.repeat.set(8, 8);
    grassNormalTexture.repeat.set(8, 8);
    grassRoughnessTexture.repeat.set(8, 8);

    grassColorTexture.wrapS = THREE.RepeatWrapping;
    grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
    grassNormalTexture.wrapS = THREE.RepeatWrapping;
    grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

    grassColorTexture.wrapT = THREE.RepeatWrapping;
    grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
    grassNormalTexture.wrapT = THREE.RepeatWrapping;
    grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

    /**
     * gui
     */
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";

    const webgl = useRef(null);

    /**
     * 场景
     */
    const scene = new THREE.Scene();

    // 辅助坐标系
    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.visible = false;
    scene.add(axesHelper);
    gui.add(axesHelper, "visible").name("axesHelper");

    // 雾
    scene.fog = new THREE.Fog("#262837", 1, 15);

    /**
     * 房子
     */
    const house = new THREE.Group();
    scene.add(house);

    // 墙
    const walls = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2.5, 4),
        new THREE.MeshStandardMaterial({
            color: "#ac8e82",
            map: bricksColorTexture,
            aoMap: bricksAmbientOcclusionTexture,
            normalMap: bricksNormalTexture,
            roughnessMap: bricksRoughnessTexture
        })
    );

    walls.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2));
    walls.position.y = walls.geometry.parameters.height / 2;
    house.add(walls);

    // 屋顶
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 1, 4),
        new THREE.MeshStandardMaterial({color: "#b35f45"})
    );
    roof.rotation.y = Math.PI * 0.25;
    roof.position.y = walls.geometry.parameters.height + roof.geometry.parameters.height / 2;
    house.add(roof);

    // 门
    const doorMaterial = new THREE.MeshStandardMaterial();
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
        doorMaterial
    );
    doorMaterial.map = doorColorTexture; // 颜色贴图
    doorMaterial.aoMap = doorAmbientOcclusionTexture; // 环境遮挡贴图
    doorMaterial.aoMapIntensity = 1; // 环境遮挡贴图强度
    doorMaterial.displacementMap = doorHeightTexture; // 位移贴图
    doorMaterial.displacementScale = 0.01; // 位移贴图强度
    doorMaterial.metalnessMap = doorMetalnessTexture; // 金属度贴图
    doorMaterial.roughnessMap = doorRoughnessTexture; // 粗糙度贴图
    doorMaterial.normalMap = doorNormalTexture; // 法线贴图
    doorMaterial.transparent = true; // 透明
    doorMaterial.alphaMap = doorAlphaTexture; // 透明度贴图

    door.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2));
    door.position.y = 1;
    door.position.z = walls.geometry.parameters.depth / 2 + 0.001;
    scene.add(door);

    // 灌木
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial({
        color: "#89c854",
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture
    });
    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.scale.set(0.5, 0.5, 0.5);
    bush1.position.set(0.8, 0.2, 2.2);


    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.scale.set(0.25, 0.25, 0.25);
    bush2.position.set(1.4, 0.1, 2.1);

    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.scale.set(0.4, 0.4, 0.4);
    bush3.position.set(-0.8, 0.1, 2.2);

    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush4.scale.set(0.15, 0.15, 0.15);
    bush4.position.set(-1, 0.05, 2.6);

    scene.add(bush1, bush2, bush3, bush4);


    // 墓碑
    const graves = new THREE.Group();
    scene.add(graves);

    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({color: "#b2b6b1"});

    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * 6;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const graveStone = new THREE.Mesh(graveGeometry, graveMaterial);

        graveStone.position.set(x, graveGeometry.parameters.height / 2 - 0.1, z);
        graveStone.rotation.y = (Math.random() - 0.5) * 0.4;
        graveStone.rotation.z = (Math.random() - 0.5) * 0.4;
        graveStone.castShadow = true;
        graves.add(graveStone);
    }


    /**
     * 地板
     */
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({
            map: grassColorTexture,
            aoMap: grassAmbientOcclusionTexture,
            normalMap: grassNormalTexture,
            roughnessMap: grassRoughnessTexture
        })
    );
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.y = 0;
    floor.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2));
    scene.add(floor);

    /**
     * 灯光
     */
    const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12); // 环境灯
    gui.add(ambientLight, "intensity").min(0).max(1).step(0.001).name("ambientLightIntensity");
    scene.add(ambientLight);

    // 定向灯
    const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12);
    moonLight.position.set(4, 5, -2);
    gui.add(moonLight, "intensity").min(0).max(1).step(0.001).name("moonLightIntensity");
    gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
    gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
    gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
    scene.add(moonLight);

    // 点光源
    const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
    doorLight.position.set(0, 2.2, 2.7);
    house.add(doorLight);

    /**
     * 幽灵
     */
    const ghost1 = new THREE.PointLight("#ff00ff", 2, 3);
    scene.add(ghost1);
    const ghost2 = new THREE.PointLight("#00ffff", 2, 3);
    scene.add(ghost2);
    const ghost3 = new THREE.PointLight("#ffff00", 2, 3);
    scene.add(ghost3);


    const sizes = {
        width: 800,
        height: 600
    };

    /**
     * 相机
     */
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.set(3, 4, 5);
    scene.add(camera);

    /**
     * 阴影
     */
    moonLight.castShadow = true;
    doorLight.castShadow = true;
    ghost1.castShadow = true;
    ghost2.castShadow = true;
    ghost3.castShadow = true;

    walls.castShadow = true;
    bush1.castShadow = true;
    bush2.castShadow = true;
    bush3.castShadow = true;
    bush4.castShadow = true;

    floor.receiveShadow = true;

    // 优化阴影性能
    doorLight.shadow.mapSize.width = 256;
    doorLight.shadow.mapSize.height = 256;
    doorLight.shadow.camera.far = 7;

    ghost1.shadow.mapSize.width = 256;
    ghost1.shadow.mapSize.height = 256;
    ghost1.shadow.camera.far = 7;

    ghost2.shadow.mapSize.width = 256;
    ghost2.shadow.mapSize.height = 256;
    ghost2.shadow.camera.far = 7;

    ghost3.shadow.mapSize.width = 256;
    ghost3.shadow.mapSize.height = 256;
    ghost3.shadow.camera.far = 7;


    useEffect(() => {
        const webglWarp = document.querySelector(".webgl_warp") as HTMLDivElement;
        webglWarp.appendChild(gui.domElement);
        // 更新渲染器尺寸
        sizes.width = webglWarp.clientWidth;
        sizes.height = webglWarp.clientHeight;
        // 更新相机
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();


        /**
         * 渲染器
         */
        const canvas = webgl.current! as HTMLCanvasElement;
        const renderer = new THREE.WebGLRenderer({
            canvas
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(sizes.width, sizes.height);
        // 设置像素比 当像素比超过2，人眼分辨不出，但是会增加性能开销，所以取最小值
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor("#262837");

        renderer.render(scene, camera);

        // 控制器
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true; // 阻尼效果


        /**
         * 动画
         */
        const clock = new THREE.Clock();
        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            const ghost1Angle = elapsedTime * 0.5;
            ghost1.position.x = Math.sin(ghost1Angle) * 4;
            ghost1.position.z = Math.cos(ghost1Angle) * 4;
            ghost1.position.y = Math.sin(elapsedTime * 3);

            const ghost2Angle = -elapsedTime * 0.32;
            ghost2.position.x = Math.sin(ghost2Angle) * 5;
            ghost2.position.z = Math.cos(ghost2Angle) * 5;
            ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

            const ghost3Angle = -elapsedTime * 0.18;
            ghost3.position.x = Math.sin(ghost3Angle) * 4 + (Math.sin(elapsedTime * 0.32) + 3);
            ghost3.position.z = Math.cos(ghost3Angle) * 4 + (Math.sin(elapsedTime * 0.32) + 3);
            ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2.5);


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
        <h2>HauntedHouse</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
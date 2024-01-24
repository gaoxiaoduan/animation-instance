import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import GradientTexture from "@/assets/textures/gradients/3.jpg";
import gsap from "gsap";

/**
 * 基于滚动的动画
 */
export const ScrollBasedAnimation: FC = () => {
    /**
     * TextureLoader
     */
    const textureLoader = new THREE.TextureLoader();
    const gradientTexture = textureLoader.load(GradientTexture);
    gradientTexture.magFilter = THREE.NearestFilter;

    /**
     * gui
     */
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";
    gui.domElement.style.zIndex = "99";

    const parameters = {
        materialColor: "#ffeded"
    };

    gui
        .addColor(parameters, "materialColor")
        .onChange(() => {
            material.color.set(parameters.materialColor);
            particlesMaterial.color.set(parameters.materialColor);
        });


    const webgl = useRef<HTMLCanvasElement>(null);
    const webglWarp = useRef<HTMLDivElement>(null);

    /**
     * 场景
     */
    const scene = new THREE.Scene();

    /**
     * 对象
     */
        // 材质
    const material = new THREE.MeshToonMaterial({
            color: parameters.materialColor,
            gradientMap: gradientTexture
        });

    // 对象
    const objectsDistance = 4; // 对象间距
    const mesh1 = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.4, 16, 60),
        material
    );
    const mesh2 = new THREE.Mesh(
        new THREE.ConeGeometry(1, 2, 32),
        material
    );
    const mesh3 = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
        material
    );
    mesh1.position.x = 2;
    mesh2.position.x = -2;
    mesh3.position.x = 2;

    mesh1.position.y = 0; // -objectsDistance * 0
    mesh2.position.y = -objectsDistance; // -objectsDistance * 1
    mesh3.position.y = -objectsDistance * 2;

    scene.add(mesh1, mesh2, mesh3);
    const sectionMeshes = [mesh1, mesh2, mesh3];

    /**
     * 灯光
     */
    const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    directionalLight.position.set(1, 1, 0);
    scene.add(directionalLight);

    /**
     * 粒子
     */
    const particlesCount = 300;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = -(Math.random() * objectsDistance * sectionMeshes.length) + objectsDistance * 0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: parameters.materialColor,
        size: 0.03
    });

    // Points
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const sizes = {
        width: 800,
        height: 600
    };

    /**
     * 相机
     */
    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(0, 0, 6);
    cameraGroup.add(camera);

    /**
     * 渲染器
     */
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    /**
     * 滚动
     */
    let scrollY = 0; // 滚动距离
    let currentSection = 0; // 当前section

    /**
     * 鼠标
     */
    const cursor = {
        x: 0,
        y: 0
    };


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

        const renderer = new THREE.WebGLRenderer({
            canvas: webgl.current!,
            alpha: true
        });

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderer.render(scene, camera);
        rendererRef.current = renderer;


        const handleMouseMove = (event: MouseEvent) => {
            cursor.x = event.offsetX / sizes.width - 0.5;
            cursor.y = event.offsetY / sizes.height - 0.5;
        };

        const handleScroll = () => {
            scrollY = webglWarpElement.scrollTop;
            const newSection = Math.round(scrollY / sizes.height);
            if (newSection !== currentSection) {
                currentSection = newSection;
                gsap.to(sectionMeshes[currentSection].rotation, {
                    duration: 1,
                    x: "+=" + Math.PI * 2,
                });
            }
        };
        webglWarpElement.addEventListener("scroll", handleScroll);
        webglWarpElement.addEventListener("mousemove", handleMouseMove);

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
            webglWarpElement.removeEventListener("scroll", handleScroll);
            webglWarpElement.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);


    /**
     * 动画
     */
    const clock = new THREE.Clock();
    let previousTime = 0;
    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - previousTime;
        previousTime = elapsedTime;

        // 滚动
        camera.position.y = -scrollY / sizes.height * objectsDistance;

        // 视差
        const parallaxX = cursor.x * 0.5;
        const parallaxY = -cursor.y * 0.5;
        cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

        // 动画
        for (const mesh of sectionMeshes) {
            mesh.rotation.x += deltaTime * 0.1;
            mesh.rotation.y += deltaTime * 0.12;
        }
        rendererRef.current?.render(scene, camera);
        requestAnimationFrame(tick);
    };
    tick();


    const sectionClassName = "flex items-center relative h-full z-10 text-yellow-400 text-[7vmin] px-[10%] odd:justify-end";
    return <div className="h-full relative bg-[#1e1a20] overflow-y-scroll" ref={webglWarp}>
        <canvas className=".webgl fixed" ref={webgl}></canvas>

        <section className={sectionClassName}>
            <h1>A circular shape</h1>
        </section>
        <section className={sectionClassName}>
            <h2>A cone</h2>
        </section>
        <section className={sectionClassName}>
            <h2>What's this?</h2>
        </section>
    </div>;
};
import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import ParticlesTexture from "@/assets/textures/particles/2.png";

/**
 * 粒子
 */
export const Particles: FC = () => {
    /**
     * TextureLoader
     */
    const textureLoader = new THREE.TextureLoader();

    const particlesTexture = textureLoader.load(ParticlesTexture);

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

    /**
     * 粒子
     */
        // 点几何体(球)
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < positions.length; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
        colors[i] = Math.random();
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // 点材质
    const particlesMaterial = new THREE.PointsMaterial();
    particlesMaterial.size = 0.2;
    particlesMaterial.sizeAttenuation = true;
    // particlesMaterial.color = new THREE.Color("#ff88cc");
    particlesMaterial.vertexColors = true;
    // particlesMaterial.map = particlesTexture;
    particlesMaterial.transparent = true;
    particlesMaterial.alphaMap = particlesTexture;
    // 解决透明度混合问题
    // 透明度测试，透明度小于0.001的像素不会渲染
    // 缺点：用户放大看时，还可以看到一些透明度小于0.001的像素
    // particlesMaterial.alphaTest = 0.001;

    // 关闭深度测试,深度测试会将后面的像素覆盖前面的像素
    // 缺点：如果还有其他物体，会导致其他物体被覆盖
    // particlesMaterial.depthTest = false;

    // 关闭深度写入，不要在深度缓冲区中写入深度值，大部分情况下的选择
    particlesMaterial.depthWrite = false;
    // 加法混合，颜色会叠加，变亮
    // 缺点：性能开销大
    // particlesMaterial.blending = THREE.AdditiveBlending;


    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);


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
        renderer.setSize(sizes.width, sizes.height);
        // 设置像素比 当像素比超过2，人眼分辨不出，但是会增加性能开销，所以取最小值
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

            // 数量过多，性能会很差
            // 可以使用着色器进行优化
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const x = particlesGeometry.attributes.position.array[i3];
                // @ts-ignore
                particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
            }

            particlesGeometry.attributes.position.needsUpdate = true;

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
        <h2>Particles</h2>
        <div className="flex-1 webgl_warp relative">
            <canvas className=".webgl" ref={webgl}></canvas>
        </div>
    </>;
};
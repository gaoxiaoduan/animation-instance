import { createHashRouter } from "react-router-dom";
import App from "../App";
import { ErrorPage } from "../components";
import { Plum } from "../pages/canvas/plum";
import {
    Animations,
    BasicScene,
    Cameras,
    DebugUI,
    FullscreenAndResizing,
    GalaxyGenerator,
    Geometries,
    HauntedHouse,
    ImportedModels,
    Lights,
    Material,
    Particles,
    Physics,
    ScrollBasedAnimation,
    Shadows,
    Text3D,
    Textures,
    TransformObjects
} from "../pages/threeJourney";

export const router = createHashRouter([
    {
        path: "/",
        element: <App/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                path: "/",
                element: <Plum/>,
                id: "Plum"
            },
            {
                path: "/BasicScene",
                element: <BasicScene/>,
                id: "BasicScene"
            },
            {
                path: "/TransformObjects",
                element: <TransformObjects/>,
                id: "TransformObjects"
            },
            {
                path: "/Animations",
                element: <Animations/>,
                id: "Animations"
            },
            {
                path: "/Cameras",
                element: <Cameras/>,
                id: "Cameras"
            },
            {
                path: "/FullscreenAndResizing",
                element: <FullscreenAndResizing/>,
                id: "FullscreenAndResizing"
            },
            {
                path: "/Geometries",
                element: <Geometries/>,
                id: "Geometries"
            },
            {
                path: "/DebugUI",
                element: <DebugUI/>,
                id: "DebugUI"
            },
            {
                path: "/Textures",
                element: <Textures/>,
                id: "Textures"
            },
            {
                path: "/Material",
                element: <Material/>,
                id: "Material"
            },
            {
                path: "/Text3D",
                element: <Text3D/>,
                id: "Text3D"
            },
            {
                path: "/Lights",
                element: <Lights/>,
                id: "Lights"
            },
            {
                path: "/Shadows",
                element: <Shadows/>,
                id: "Shadows"
            },
            {
                path: "/HauntedHouse",
                element: <HauntedHouse/>,
                id: "HauntedHouse"
            },
            {
                path: "/Particles",
                element: <Particles/>,
                id: "Particles"
            },
            {
                path: "/GalaxyGenerator",
                element: <GalaxyGenerator/>,
                id: "GalaxyGenerator"
            },
            {
                path: "/ScrollBasedAnimation",
                element: <ScrollBasedAnimation/>,
                id: "ScrollBasedAnimation"
            },
            {
                path: "/Physics",
                element: <Physics/>,
                id: "Physics"
            },
            {
                path: "/ImportedModels",
                element: <ImportedModels/>,
                id: "ImportedModels"
            },

        ]
    }
]);
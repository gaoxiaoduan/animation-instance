import { createHashRouter } from "react-router-dom";
import App from "../App";
import { ErrorPage } from "../components";
import { Plum } from "../pages/canvas/plum";
import { Animations, BasicScene, Cameras, FullscreenAndResizing, TransformObjects } from "../pages/threeJourney";

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
            }
        ]
    }
]);
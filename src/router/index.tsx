import { createHashRouter } from "react-router-dom";
import App from "../App";
import { ErrorPage } from "../components";
import { Plum } from "../pages/canvas/plum";
import { BasicScene, TransformObjects } from "../pages/threeJourney";

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
            }
        ]
    }
]);
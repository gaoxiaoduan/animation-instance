import { createHashRouter } from "react-router-dom";
import App from "../App";
import { Plum } from "../pages/canvas/plum";
import { ErrorPage } from "../components";

export const router = createHashRouter([
    {
        path: "/",
        element: <App/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                path: "/",
                element: <Plum/>,
                id: "plum"
            },
            {
                path: "/2",
                element: "test",
                id: "2"
            }
        ]
    }
]);
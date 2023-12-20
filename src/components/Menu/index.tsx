import { FC } from "react";
import { NavLink } from "react-router-dom";
import { router } from "../../router";

export const Menu: FC = () => {
    const {routes} = router;

    return (
        <nav className="max-h-screen w-80 overflow-y-auto">
            <ul className="menu">
                {
                    routes?.[0]?.children?.map((route) => (
                        <li key={route.id}>
                            <NavLink to={route.path!}>{route.id}</NavLink>
                        </li>
                    ))
                }
            </ul>
        </nav>
    );
};
import { FC } from "react";

export const Menu: FC = () => {
    return (
        <nav className="max-h-screen w-80 overflow-y-auto">
            <ul className="menu">
                <li><a>Item 1</a></li>
                <li><a>Item 2</a></li>
                <li><a>Item 3</a></li>
            </ul>
        </nav>
    );
};
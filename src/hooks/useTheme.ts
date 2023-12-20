import { useEffect, useState } from "react";

export const useTheme = () => {
    const [theme, setTheme] = useState("light");

    // 从 localStorage 中获取主题
    useEffect(() => {
        const localTheme = window.localStorage.getItem("theme");
        if (localTheme) {
            setTheme(localTheme);
            document.documentElement.setAttribute("data-theme", localTheme);
        }
    }, []);

    // 监听系统主题变化
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        const handleColorSchemeChange = (e: MediaQueryListEvent) => {
            const newColorScheme = e.matches ? "dark" : "light";
            setTheme(newColorScheme);
            window.localStorage.setItem("theme", newColorScheme);
        };

        window.matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", handleColorSchemeChange);

        return () => {
            // 清理副作用
            window.matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", handleColorSchemeChange);
        };

    }, [theme]);

    return {theme, setTheme};
};

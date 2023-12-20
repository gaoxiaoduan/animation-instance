import { Menu, Navbar } from "./components";
import { Outlet, useNavigation } from "react-router-dom";

function App() {
    const navigation = useNavigation();
    return (
        <div className="min-h-screen">
            <Navbar/>

            <div className="w-full min-h-full flex flex-row">
                <Menu/>
                <main
                    className={
                        navigation.state === "loading" ? "w-1/4 loading" : "w-full"
                    }
                >
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}

export default App;

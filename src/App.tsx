import { Plum } from "./pages/canvas/plum";
import { Menu, Navbar } from "./components";

function App() {

    return (
        <div className="min-h-screen">
            <Navbar/>

            <div className="w-full min-h-full flex flex-row">
                <Menu/>
                <main className="w-full">
                    <Plum/>
                </main>
            </div>

        </div>
    );
}

export default App;

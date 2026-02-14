import Sidebar from "@/components/Sidebar"
import LandingPage from "@/pages/LandingPage"
import { Routes, Route } from "react-router-dom"

const AppRoutes = () => {
    return (
        <div className="flex items-start justify-normal">
            <Sidebar />
                    
            <main className="grow">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </main>
        </div>
    )
}


export default AppRoutes
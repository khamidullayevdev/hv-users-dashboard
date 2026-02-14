import Sidebar from "@/components/Sidebar"
import UsersTable from "@/components/UsersTable"
import { Routes, Route } from "react-router-dom"

const AppRoutes = () => {
    return (
        <div className="flex items-start justify-normal">
            <Sidebar />
                    
            <main className="grow">
                <Routes>
                    <Route path="/" element={<UsersTable />} />
                </Routes>
            </main>
        </div>
    )
}


export default AppRoutes
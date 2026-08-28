import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import BatchesPage from "../pages/dashboard/BatchesPage";
import SemesterCoursesPage from "../pages/dashboard/SemesterCoursesPage";
import CourseDetailPage from "../pages/dashboard/CourseDetailPage";
import UploadResourcePage from "../pages/dashboard/UploadResourcePage";
import MyUploadsPage from "../pages/dashboard/MyUploadsPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/auth/login" />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />

            <Route element={<DashboardLayout />}>
                <Route path="/dashboard/batches" element={<BatchesPage />} />
                <Route path="/dashboard/batches/:batchId" element={<SemesterCoursesPage />} />
                <Route path="/dashboard/courses/:courseId" element={<CourseDetailPage />} />
                <Route path="/dashboard/courses/:courseId/upload" element={<UploadResourcePage />} />
                <Route path="/dashboard/my-uploads" element={<MyUploadsPage />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
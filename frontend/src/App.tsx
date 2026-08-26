import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import CoursesPage from "./pages/dashboard/CoursesPage";
import CourseDetailPage from "./pages/dashboard/CourseDetailPage";
import UploadResourcePage from "./pages/dashboard/UploadResourcePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/courses" element={<CoursesPage />} />
          <Route path="/dashboard/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/dashboard/courses/:courseId/upload" element={<UploadResourcePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
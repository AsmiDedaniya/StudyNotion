import logo from './logo.svg';
import './App.css';
import{Route,Routes} from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"  
import Home from './Pages/Home';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Navbar from './components/common/Navbar';
import ForgotPassword from './Pages/ForgotPassword';
import UpdatePassword from './Pages/UpdatePassword';
import VerifyEmail from './Pages/VerifyEmail';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Dashboard from './Pages/Dashboard';
import MyProfile from './components/core/Dashboard/MyProfile';
import PrivateRoute from './components/core/Auth/PrivateRoute';
import AddCourse from './components/core/Dashboard/AddCourse';
import MyCourses from './components/core/Dashboard/MyCourses';
import { ACCOUNT_TYPE } from "./utils/constants";
import Error from './Pages/Error';
import EditCourse from './components/core/Dashboard/EditCourse'
import Catalog from './Pages/Catalog';
import CourseDetails from './Pages/CourseDetails';
import Cart from "./components/core/Dashboard/Cart"
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses"
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import ViewCourse from "./Pages/ViewCourse";
import Settings from "./components/core/Dashboard/Settings";
import Instructor from "./components/core/Dashboard/Instructor"
function App() {
  const { user } = useSelector((state) => state.profile)
  return (
   <div className='w-screen min-h-screen bg-richblack-900 flex flex-col font-inter'>
    <Navbar/>
<Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/catalog/:catalogName" element={<Catalog/>}/>
  <Route path="/signup" element={<Signup/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path='/forgot-password' element={<ForgotPassword/>}/>
  <Route path='/update-password/:id' element={<UpdatePassword/>}/>
  <Route path='/verify-email' element={<VerifyEmail/>}/>
  <Route path='/about' element={<About/>}/>
  <Route path='/contact' element={<Contact/>}/>
  <Route path='/courses/:courseId' element={<CourseDetails/>}/>
  {/* <Route element={<PrivateRoute>
    <Dashboard/>
    </PrivateRoute>}/>
  <Route path="/dashboard/my-profile"  element={<MyProfile/>}/>
  <Route path="dashboard/add-course" element={<AddCourse />} /> */}

<Route element = {<PrivateRoute> <Dashboard /> </PrivateRoute>} >

<Route path="dashboard/my-profile" element={ < MyProfile />} /> 

<Route path="dashboard/Settings" element={<Settings />} />
  { user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
                          <>
                               <Route path="dashboard/instructor" element={<Instructor />} /> 
                              <Route path="dashboard/add-course" element={<AddCourse />} />
                              <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
                              <Route path="dashboard/my-courses" element={<MyCourses />} />    
                          </>
                    )
      }

{ user?.accountType === ACCOUNT_TYPE.STUDENT && (          
                                    <>
                                        <Route path="dashboard/cart" element={<Cart />} />
                                        <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
                                    </>
                                )           
                  }
</Route>
<Route element = { <PrivateRoute> <ViewCourse /> </PrivateRoute> }>
                { user?.accountType === ACCOUNT_TYPE.STUDENT && (
                                                <>
                                                  <Route path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId" element={<VideoDetails />} /> 
                                                </>
                                  )
                  }
          </Route>
<Route path="*" element={<Error />} />
</Routes>
   </div>
  );
}

export default App;

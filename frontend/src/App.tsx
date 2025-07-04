import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {Signup} from './pages/Signup'
import { Signin } from "./pages/Signin";
import { Blogs } from "./pages/Blogs";
import { Blog } from "./pages/Blog";
import  {Publish}  from "./pages/Publish";
import {Profile}  from "./pages/Profile";
import { Edit } from "./pages/Edit";
import './App.css'

function App() {


  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path = '/' element ={<Blogs/>}/>
        <Route path ='/signup' element ={<Signup/>}/>
        <Route path ='/signin' element ={<Signin/>}/>
        <Route path="/blog/:id" element={<Blog/>} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit/:id" element={<Edit />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

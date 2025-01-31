import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import { createSection, updateSection, } from "../../../../../services/operations/courseDetailsAPI"
import {setCourse, setEditCourse,  setStep,} from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import NestedView from "./NestedView"
import { setSection } from "../../../../../slices/sectionSlice"


export default function CourseBuilderForm() {

  const {register, handleSubmit, setValue, formState: { errors },} = useForm()
  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const {Section}=useSelector((state)=>state.Section)
  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState(null)
  const dispatch = useDispatch()
  const [sections, setSections] = useState([]);

   
  const onSubmit = async (data) => {                        // handle form submission
     console.log(data)
    setLoading(true)
    let response

    if(editSectionName) {
      response = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        token
      )
      // console.log("edit", response)
     
    } else {
      response = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        token , {new:true}
      )
  
      console.log("save", response)
    }

  //   if(response) {
  //     // console.log("section response", response)
  //     dispatch(setCourse(response));
  //     setEditSectionName(null);
  //     setValue("sectionName", "");
  //   }
  //   setLoading(false);
  // }
  if (response) {
    dispatch(setCourse(response));
    dispatch(setSection(response));
    setEditSectionName(null);
    setValue("sectionName", "");

    // Update the sections state
    if (editSectionName) {
      // If editing existing section, update the corresponding section in the state
      setSections(prevSections =>
        prevSections.map(section =>
          section._id === editSectionName ? { ...section, sectionName: data.sectionName } : section
        )
      );
    } else {
      // If creating new section, add the new section to the state
      setSections(prevSections => [...prevSections, response.section]);
    }
  }

  setLoading(false);
};
  const cancelEdit = () => {
    setEditSectionName(null);
    setValue("sectionName", "");
  }

  // const handleChangeEditSectionName = (sectionId, sectionName) => {
  //   console.log("hello change");
  //   console.log("sectionId",sectionId);
  //   console.log("sectionName",sectionName);
  //   if(editSectionName === sectionId) {
  //     console.log("editSectionName",editSectionName);
  //     cancelEdit();
  //     return
  //   }
  //   setEditSectionName(sectionId);
  //   setValue("sectionName", sectionName);

  //   // const updatedSections = sections.map(section => {
  //   //   if (section.id === sectionId) {
  //   //     return { ...section, name: sectionName };
  //   //   }
  //   //   return section;
  //   // });
  //   // setSections(updatedSections);

  //   setSections(prevSections =>
  //     prevSections.map(section =>
       
  //       section.id === sectionId ? { ...section, sectionName: sectionName } : section
  //     )
  //   );
    
  // }

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    console.log("hello change");
    console.log("sectionId",sectionId);
    console.log("sectionName",sectionName);
  
    // Always update the editSectionName and sectionName
    setEditSectionName(sectionId);
    setValue("sectionName", sectionName);
  
    // Update the sections state
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, sectionName: sectionName } : section
      )
    );
  }
  
  const goToNext = () => {
    console.log("course.coursecontent",course.courseContent)
    if (course.courseContent.length === 0) {
      toast.error("Please add atleast one section");
      return
    }
    if (
      Section.subSection.length===0
    ) {
      toast.error("Please add atleast one lecture in each section")
      return
    }
    dispatch(setStep(3))
  }

  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }


  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">  Section Name <sup className="text-pink-200">*</sup>  </label>
          <input id="sectionName"  disabled={loading} placeholder="Add a section to build your course" {...register("sectionName", { required: true })}  className="form-style w-full" />
          {errors.sectionName && ( <span className="ml-2 text-xs tracking-wide text-pink-200">  Section name is required </span>  )}
        </div>
       
        <div className="flex items-end gap-x-4">
          <IconBtn type="submit" disabled={loading} text={editSectionName ? "Edit Section Name" : "Create Section"}  outline={true} >
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </IconBtn>
          {editSectionName && (
            <button type="button" onClick={cancelEdit} className="text-sm text-richblack-300 underline" >
              Cancel Edit
            </button>
          )}
        </div>
     
      </form>
     
      {course.courseContent.length > 0 && ( <NestedView handleChangeEditSectionName={handleChangeEditSectionName} /> )}
      
      {/* Next Prev Button */}
      <div className="flex justify-end gap-x-3">
        <button onClick={goBack}  className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`} >
          Back
        </button>
        <IconBtn disabled={loading} text="Next" onclick={goToNext}>
          <MdNavigateNext />
        </IconBtn>
      </div>
   
    </div>
  

)}
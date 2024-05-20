import { useState ,useEffect,useRef} from "react"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { RxDropdownMenu } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {deleteSection, deleteSubSection,fetchSectionDetails, fetchsubSectionDetails} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import ConfirmationModal from "../../../../common/ConfirmationModal"
import SubSectionModal from "./SubSectionModal"
import { setSection } from "../../../../../slices/sectionSlice"


export default function NestedView({ handleChangeEditSectionName }) {

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const{Section}=useSelector((state)=>state.Section)
  const dispatch = useDispatch()
   
  const [addSubSection, setAddSubsection] = useState(null)            // States to keep track of mode of modal [add, view, edit]
  const [viewSubSection, setViewSubSection] = useState(null)
  const [editSubSection, setEditSubSection] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)             // to keep track of confirmation modal
  const [sectionNames, setSectionNames] = useState({});
  const[sectionId,setSectionId]=useState({});

  const[subSectionName,setsubSectionName]=useState({});
  const[subSectionId,setsubSectionId]=useState({});
  console.log(Section);
  
//   useEffect(() => {
//   console.log("hello from fect section");
//     const fetchSectionNames = async () => {
//       const newSectionNames = {};
//       const newSectionId={};
// console.log("course",course.courseContent);
//       for (const section of course.courseContent) {
//         const result = await fetchSectionDetails(section, token);
//         console.log("result:",result);
//         newSectionNames[section] = result.data[0].sectionName;
//         newSectionId[section]=result.data[0]._id;
//      //   dispatch(setSection(result.data[0]));
//       }
//       setSectionNames(newSectionNames);
//       setSectionId(newSectionId);
//       fetchSectionNames();
//     };
      
  // }, [course, token]);
//   useEffect(() => {
//     console.log("hello from fetch section");
  
//  if(course.courseContent.length>0){
//   const fetchSectionNames = async () => {
//     const newSectionNames = {};
//     const newSectionId = {};
//     console.log("course", course.courseContent);

//     for (const section of course.courseContent) {
//       const result = await fetchSectionDetails(section, token);
//       console.log("result:", result);
//       newSectionNames[section] = result.data[0].sectionName;
//       newSectionId[section] = result.data[0]._id;
//         dispatch(setSection(result.data[0]));
//     }
//     setSectionNames(newSectionNames);
//     setSectionId(newSectionId);
//   };

//   // Only call fetchSectionNames, don't call it inside itself
//   fetchSectionNames();
//  }
  
//   }, [course.courseContent, token]);
const prevContentLengthRef = useRef(course.courseContent.length);
useEffect(() => {
  console.log("hello from fetch section");

  const fetchSectionNames = async () => {
    const newSectionNames = {};
    const newSectionId = {};
    console.log("course", course.courseContent);

    for (const section of course.courseContent) {
      const result = await fetchSectionDetails(section, token);
      console.log("result:", result);
      newSectionNames[section] = result.data[0].sectionName;
      newSectionId[section] = result.data[0]._id;
      dispatch(setSection(result.data[0]));
    }
    setSectionNames(newSectionNames);
    setSectionId(newSectionId);
  };

  if (course.courseContent.length > prevContentLengthRef.current) {
    // Only call fetchSectionNames if a new section is added
    fetchSectionNames();
  }

  // Update the ref with the current length of courseContent
  prevContentLengthRef.current = course.courseContent.length;

}, [course.courseContent, token, dispatch]);

  console.log("section name:",sectionNames);
  console.log("sectionId",sectionId);

console.log("section",Section);
  // useEffect(() => {
  //   console.log("section",Section);
  //   if(Section.subSection.length>0 && course.courseContent.length>0){
  //     const fetchsubSectionname = async () => {
  //       const newsubsectionname={};
  //       const newsubsectionId={};
  //       for(const subsection of Section.subSection){
  //         console.log("subsectionId",subsection);
  //         const result=await fetchsubSectionDetails(subsection,token);
  //         console.log("result tite",result);
  //         newsubsectionname[subsection]=result.title;
  //         newsubsectionId[subsection]=subsection._id;
  //        // console.log(newsubsectionname);
  //       }
  //       setsubSectionName(newsubsectionname);
  //       setsubSectionId(newsubsectionId);
  //     }
  //     fetchsubSectionname();
  //   }
  
  // }, [Section,token]);

  const prevSubSectionLengthRef = useRef(Section?.subSection?.length || 0);

  useEffect(() => {
    console.log("section", Section);

    if (Section && Section.subSection && Section.subSection.length > prevSubSectionLengthRef.current && course && course.courseContent.length > 0) {
      const fetchsubSectionname = async () => {
        const newsubsectionname = {};
        const newsubsectionId = {};
        for (const subsection of Section.subSection) {
          console.log("subsectionId", subsection);
          const result = await fetchsubSectionDetails(subsection, token);
          console.log("result tite", result.data[0].title);
          console.log("result",result);

          newsubsectionname[result.data[0]._id] = result.data[0].title;
          newsubsectionId[result.data[0]._id] = result.data[0]._id;

          // console.log(newsubsectionname);
        }
        setsubSectionName(newsubsectionname);
        setsubSectionId(newsubsectionId);
      }
      fetchsubSectionname();
    }

  {Section?.subSection?.map((data)=>(console.log("subsectionId",subSectionId[data])))}
    // Update the ref with the current length of subSection if Section.subSection is defined
    if (Section && Section.subSection) {
      prevSubSectionLengthRef.current = Section.subSection.length;
    }

  }, [Section, token, course]);
  const handleDeleleSection = async (sectionId) => {
    const result = await deleteSection({sectionId, courseId: course._id},  token, )
    console.log(sectionId);
    if(result) {
      dispatch(setCourse(result))
    }
    setConfirmationModal(null)
  }

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId}, token )

    if(result){                                                                    // update the structure of course
      const updatedCourseContent = course.courseContent.map((section) => section._id === sectionId ? result : section  )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setConfirmationModal(null)
  }

  // const checksubsection = async (subSectionId) => {
  //   const result = await fetchsubSectionDetails(subSectionId, token);
  //   if (result.data.length > 0) {
  //     setsubSectionName(result.data[0].title);
   
  //   }
  // };
  return (
 
    <>
     
      <div className="rounded-lg bg-richblack-700 p-6 px-8" id="nestedViewContainer"  >
        
      
        {course?.courseContent?.map((section) => (
          // Section Dropdown
          <details key={sectionId[section]} open>
            {/* Section Dropdown Content */}
           
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-white" />
                {/* <p className="font-semibold text-white"> {section.sectionName} </p>  */}
                <p className="font-semibold text-white">{sectionNames[section]} </p> 
              </div>
              <div className="flex items-center gap-x-3">
                <button onClick={() => handleChangeEditSectionName(sectionId[section], sectionNames[section] )} >
                  <MdEdit className="text-xl text-richblack-300" />
                </button>
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete this Section?",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleleSection(sectionId[section]),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                >
                  <RiDeleteBin6Line className="text-xl text-richblack-300" />
                </button>
                <span className="font-medium text-richblack-300">|</span>
                <AiFillCaretDown className={`text-xl text-richblack-300`} />
              </div>
            </summary>
           
            <div className="px-6 pb-4">
             
 {Section?.subSection?.map((data) => (
  <div key={data._id} onClick={() => setViewSubSection(data)} className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2" >
    <div className="flex items-center gap-x-3 py-2 ">
      <RxDropdownMenu className="text-2xl text-white" />
      <p className="font-semibold text-white"> {subSectionName[data]} </p>
     
    </div>
    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-x-3" >
      <button onClick={() => setEditSubSection({ ...data, sectionId: Section._id })} >
        <MdEdit className="text-xl text-richblack-300" />
      </button>
      <button
        onClick={() =>
          setConfirmationModal({
            text1: "Delete this Sub-Section?",
            text2: "This lecture will be deleted",
            btn1Text: "Delete",
            btn2Text: "Cancel",
            btn1Handler: () =>
              handleDeleteSubSection(subSectionId[data], sectionId[section]),
            btn2Handler: () => setConfirmationModal(null),
          })
        }
      >
        <RiDeleteBin6Line className="text-xl text-richblack-300" />
      </button>
    </div>
  </div>
))}    
              <button onClick={() => {
    setAddSubsection(sectionId[section]);
 
}} className="mt-3 flex items-center gap-x-1 text-yellow-50">
    <FaPlus className="text-lg" />
    <p>Add Lecture</p>
    
</button>
{/* {
      // addSubSection?(<p>{addSubSection.title}</p>):<p>hello</p>
      subSectionName?(<p>)
    } */}

            

      
            </div>
          
          </details>
        ))}

        
      </div>
    
   
     
      {/* Modal Display */}
      <p>{`${addSubSection},${viewSubSection},${setAddSubsection},`}</p>
      {addSubSection ? (
        <SubSectionModal modalData={addSubSection} setModalData={setAddSubsection}  add={true} />
         ) : viewSubSection ? (
        <SubSectionModal modalData={viewSubSection}  setModalData={setViewSubSection} view={true} />
      ) : editSubSection ? (
        <SubSectionModal  modalData={editSubSection} setModalData={setEditSubSection}  edit={true}  />
      ) : (
        <></>
      )}
      {/* Confirmation Modal */}
      {confirmationModal ? (<ConfirmationModal modalData={confirmationModal} />) : (  <></> )}
       
    </>
  

)}
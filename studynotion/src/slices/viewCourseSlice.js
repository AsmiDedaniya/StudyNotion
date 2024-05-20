import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  courseSectionData: [],
  courseEntireData: [],
  completedVideos: [],
  totalNoOfLectures: 0,
}

const viewCourseSlice = createSlice({
  name: "viewCourse",
  initialState,
  reducers: {
    setCourseSectionData: (state, action) => {
      state.courseSectionData = action.payload
    },
    setEntireCourseData: (state, action) => {
      state.courseEntireData = action.payload
    },
    setTotalNoOfLectures: (state, action) => {
      state.totalNoOfLectures = action.payload
    },
    setCompletedVideos: (state=initialState, action) => {
      state.completedVideos = action.payload
      console.log(state.completedVideos);
    },
    // updateCompletedLectures: (state, action) => {
    //   state.completedLectures = [...state.completedLectures, action.payload]
    // },
    updateCompletedVideos: (state, action) => {
    
        // state.completedVideos = [...state.completedVideos, action.payload];
        if (!Array.isArray(state.completedVideos)) {
          state.completedVideos = [];
      }
  
      // Push the new payload into the completedVideos array
      state.completedVideos.push(action.payload);
      
    },
    // toggleCompletedLecture: (state, action) => {
    //   if (state.completedLectures.includes(action.payload)) {
    //     state.completedLectures = state.completedLectures.filter(id => id !== action.payload);
    //   } else {
    //     state.completedLectures = [...state.completedLectures, action.payload]
    //   }
    // },
  },
})


export const {setCourseSectionData, setEntireCourseData, setTotalNoOfLectures, setCompletedVideos,  updateCompletedVideos} = viewCourseSlice.actions

export default viewCourseSlice.reducer
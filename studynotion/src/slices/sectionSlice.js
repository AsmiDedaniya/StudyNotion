import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  Section: null,
  editSection: false,
  
}

const sectionSlice = createSlice({
  name: "Section",
  initialState,
  reducers: {
    
    setSection: (state, action) => {
      state.Section = action.payload
    },
    setEditSection: (state, action) => {
      state.editSection = action.payload
    },
   
    resetSectionState: (state) => {
      state.step = 1
      state.Section = null
      state.editSection = false
    },
  },
})

export const {  setSection,  setEditSection, resetSectionState,} = sectionSlice.actions
   

export default sectionSlice.reducer
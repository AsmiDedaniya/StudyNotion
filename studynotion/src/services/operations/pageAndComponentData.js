import {toast} from "react-hot-toast"
import { apiConnector } from '../apiconnector';
import { catalogData } from '../apis';


export const getCatalogaPageData = async(categoryId) => {
  const toastId = toast.loading("Loading...");
  let result = [];
  try{
        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API,  {categoryId: categoryId,});
    console.log("response",response);
    console.log("data",response?.data);
        if(!response?.data){
            throw new Error("Could not Fetch Category page data");
          }
         result = response?.data;
         console.log("result in api",result);
  }
  catch(error) {
    console.log("CATALOG PAGE DATA API ERROR....", error);
    toast.error(error.message);
    result = error.response?.data;
  }
  toast.dismiss(toastId);
  return result;
}

 
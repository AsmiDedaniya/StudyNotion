const mongoose=require("mongoose");
const purchaseHistorySchema=new mongoose.Schema({
   courseID:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course",
   },
   paymentId:{
    type:String
   },
   orderId:{
    type:String
   }
});

module.exports=mongoose.model("PurchaseHistory",purchaseHistorySchema);
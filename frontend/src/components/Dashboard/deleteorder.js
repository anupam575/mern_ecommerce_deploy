import axios from "axios";
import { toast } from "react-toastify"; // optional for notifications

const deleteOrderById = async (orderId) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/v1/admin/order/${orderId}`,
      {
        withCredentials: true, // ✅ send cookie automatically
      }
    );

    if (response.data.success) {
      toast.success("🗑️ Order deleted successfully");
      return true;
    } else {
      toast.error("❌ Failed to delete order");
      return false;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "❌ Error deleting order");
    return false;
  }
};

export default deleteOrderById;

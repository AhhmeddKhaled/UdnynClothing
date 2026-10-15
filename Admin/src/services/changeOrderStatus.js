const API_URL = import.meta.env.VITE_API_URL;

export function changeOrderStatus(id) {

    console.log(`${API_URL}/${id}/status`);
    
}
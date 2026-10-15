import { useState , useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function useSendData(id,status) {
    const url = `${API_URL}/api/orders/${id}status`;

    console.log(url);
    
}
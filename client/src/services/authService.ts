import React from 'react'
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const API_URL = 'http://localhost:3009';

export const authService = {

  login: async (email: string, password: string, role: "user" | "admin") => {
    const endpoint = role === "admin" ? "/admin/login" : "/login";
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Login failed:", errorResponse);  
            throw new Error("Invalid credentials");
        }

        console.log(response,">>>>>>>>>>>>>>>>>>>321");
        

        return response;
    } catch (error) {
        console.error("Error during login request:", error);
        throw error;
    }
},

    verifyOtp: async (email: string, enterdOtp: string) => {
        const response = await fetch(`${API_URL}/verify_otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, enterdOtp }),
        });
      
        if (!response.ok) {
          throw new Error("Invalid credentials");
        }

        console.log(response,"res");
        
      
        return response;
      },
      

    resendOtp : async(email : string)=>{
        const response =  await fetch(`${API_URL}/resend_otp`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body : JSON.stringify({email})
            
        })
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        console.log(data,"otp stage 1 data");
        toast.success(data.msg || " Resend OTP successfully!!");
        return response;
    },

    register: async (userData: {
      fullname: string;
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
      gender: string;
    }) => {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
    
      const data = await response.json(); // Parse the response body once
      console.log("Response Data:", data);
    
      if (response.ok) {
    ;
        return data; // Return the parsed data
      } else {
    
        throw new Error(data.message || "Registration failed.");
      }
    },
    
    
    requestOtp: async (email: string) => {
        const response = await fetch(`${API_URL}/request_otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })

        if (!response.ok) {
            throw new Error('Invalid email');
        }

        const data = await response.json();
        return data;
    },

    resetPassword: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/reset_password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const data = await response.json();
        return data;
    },

    verifyOtpf: async (email: string, enterdOtp: string) => {
        const response = await fetch(`${API_URL}/verify_otpf`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, enterdOtp }),
        });
      
        if (!response.ok) {
          throw new Error("Invalid credentials");
        }
      
        return response;
      },

    getUser: async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('Invalid token');
        }

        const response = await fetch(`${API_URL}/user`, {
            headers: {
                Authorization: token 
            },
        })

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const data = await response.json();
        return data;
    },  
    
    getAdmin: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
          throw new Error('Invalid token');
      }

      const response = await fetch(`${API_URL}/user`, {
          headers: {
              Authorization: token 
          },
      })

      if (!response.ok) {
          throw new Error('Invalid token');
      }

      const data = await response.json();
      return data;
  },  
  
  getAllUsers: async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        throw new Error('Invalid token');
    }

    const response = await fetch(`${API_URL}/admin/users`,{
      headers:{
        Authorization: token 
      }
    }); 
    // console.log(response,"><><><><>");
    
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Login failed:", errorResponse); 
      throw new Error("Failed to fetch users");
    }


    return response.json();
  } catch (error) {
    console.log(error);
    
  }
  },

}

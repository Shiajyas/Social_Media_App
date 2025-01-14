import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export const useUserAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();


  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: authService.getUser,
    enabled: !!localStorage.getItem("userToken"),
    initialData: () => {
      const userToken = localStorage.getItem("userToken");
      return userToken ? { token: userToken } : null;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authService.login(email, password, "user");
      return response;
    },
    onSuccess: async (data) => {
      const responseData = await data.json();
      const token = responseData.token;
      const userData = responseData.user;

      queryClient.setQueryData(["user"], userData);
      localStorage.setItem("userToken", token);
      navigate("/home");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Invalid email or password.");
    },
  });

  const logout = () => {
    localStorage.removeItem("userToken");
    queryClient.setQueryData(["user"], null);
    navigate("/login");
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, enterdOtp }: { email: string; enterdOtp: string }) => {
      const response = await authService.verifyOtp(email, enterdOtp);
      return response;
    },
    onSuccess: async (data) => {
      const responseData = await data.json();
      localStorage.setItem("userToken", responseData.token);
      toast.success("User verified");
      queryClient.setQueryData(["user"], responseData.user);
      navigate("/home");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Invalid OTP. Please try again.");
    },
    retry: false,
  });

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return authService.requestOtp(email);
    },
  });

  const verifyOtpfMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      return authService.verifyOtpf(email, otp);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return authService.resetPassword(email, password);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return authService.resendOtp(email);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      fullname: string;
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
      gender: string;
    }) => {
      // Call the register function
      const data = await authService.register(userData);
      return data; // Return the parsed data directly
    },
    onSuccess: (responseData) => {
      queryClient.setQueryData(["userEmail"], { email: responseData.email });
      toast.success("Registration successful! Please verify your OTP.");
    },
    onError: (error: any) => {
      console.error("Error during registration:", error.message || error);
      toast.error(error.message || "An error occurred during registration.");
    },
  });
  
  const {isPending: isRegisterLoading} = registerMutation;
  const {isPending: isOtpLoading} = verifyOtpMutation;

  return { user, isLoading, isError,isRegisterLoading,
     loginMutation, logout, verifyOtpMutation,resendOtpMutation,
     resetPasswordMutation,verifyOtpfMutation,requestOtpMutation ,
     registerMutation,isOtpLoading
    
    };
};



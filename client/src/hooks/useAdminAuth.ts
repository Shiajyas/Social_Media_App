import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export const useAdminAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
  

    const { data: admin, isLoading, isError } = useQuery({
      queryKey: ["admin"],
      queryFn: authService.getAdmin,
      enabled: !!localStorage.getItem("adminToken"),
      initialData: () => {
        const adminToken = localStorage.getItem("adminToken");
        return adminToken ? { token: adminToken } : null;
      },
    });
  
    const loginMutation = useMutation({
      mutationFn: async ({ email, password }: { email: string; password: string }) => {
        const response = await authService.login(email, password, "admin");
        return response;
      },
      onSuccess: async (data) => {
        const responseData = await data.json();
        const token = responseData.token;
        const adminData = responseData.user;
  
        queryClient.setQueryData(["admin"], adminData);
        localStorage.setItem("adminToken", token);
        navigate("/admin/dashboard");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Invalid email or password.");
      },
    });
  
  
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
  
  
    const logout = () => {
      localStorage.removeItem("adminToken");
      queryClient.setQueryData(["admin"], null);
      navigate("/admin/login");
    };
  
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
  
    return { admin, isLoading, isError, loginMutation, logout,verifyOtpMutation,resendOtpMutation,resetPasswordMutation,verifyOtpfMutation,requestOtpMutation };
  };